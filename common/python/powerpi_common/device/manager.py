from copy import deepcopy
from typing import Any, Dict, List, Union

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.typing import DeviceType, SensorType
from powerpi_common.util import ismixin
from .base import BaseDevice
from .factory import DeviceFactory
from .mixin import InitialisableMixin
from .types import DeviceConfigType


class DeviceManager(InitialisableMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        factory: DeviceFactory
    ):
        self.__config = config
        self.__logger = logger
        self.__factory = factory

        self.__devices: Dict[DeviceConfigType, Dict[str, Union[DeviceType, SensorType]]] = {}
        for device_type in DeviceConfigType:
            self.__devices[device_type] = {}

    @property
    def devices(self) -> DeviceType:
        return self.__devices[DeviceConfigType.DEVICE]

    @property
    def sensors(self) -> SensorType:
        return self.__devices[DeviceConfigType.SENSOR]

    def get_device(self, name: str) -> DeviceType:
        return self.__get(DeviceConfigType.DEVICE, name)

    def get_sensor(self, name: str) -> SensorType:
        return self.__get(DeviceConfigType.SENSOR, name)
    
    async def load(self):
        for device_type in DeviceConfigType:
            self.__load(device_type)
        
        await self.initialise()
    
    async def _initialise(self):
        for device_type in DeviceConfigType:
            filtered = filter(
                lambda device: ismixin(device, InitialisableMixin),
                self.__devices[device_type].values()
            )

            for device in filtered:
                await device.initialise()

    def __get(self, device_type: DeviceConfigType, name: str):
        try:
            return self.__devices[device_type][name]
        except KeyError:
            raise DeviceNotFoundException(device_type, name)

    def __load(self, device_type: DeviceConfigType):
        devices: List[Dict[str, Any]] = self.__config.devices[f'{device_type}s']

        for device in devices:
            instance_type = device['type']

            device_args = deepcopy(device)
            del device_args['type']

            instance = self.__factory.build(device_type, instance_type, **device_args)
            if instance is not None:
                self.__logger.info(f'Found {instance}')

                self.__devices[device_type][device['name']] = instance

        self.__logger.info(f'Found {len(self.__devices[device_type])} matching {device_type}(s)')


class DeviceNotFoundException(Exception):
    def __init__(self, device_type: DeviceConfigType, name: str):
        message = f'Cannot find {device_type} "{name}"'
        Exception.__init__(self, message)
