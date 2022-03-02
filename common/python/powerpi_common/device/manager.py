from copy import deepcopy
from typing import Any, Dict, List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .base import BaseDevice
from .factory import DeviceFactory
from .types import DeviceType


class DeviceManager(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        factory: DeviceFactory
    ):
        self.__config = config
        self.__logger = logger
        self.__factory = factory

        self.__devices: Dict[DeviceType, Dict[str, BaseDevice]] = {}
        for device_type in DeviceType:
            self.__devices[device_type] = {}

    @property
    def devices(self):
        return self.__devices[DeviceType.DEVICE]

    @property
    def sensors(self):
        return self.__devices[DeviceType.SENSOR]

    def get_device(self, name: str):
        return self.__get(DeviceType.DEVICE, name)

    def get_sensor(self, name: str):
        return self.__get(DeviceType.SENSOR, name)
    
    def load(self):
        for device_type in DeviceType:
            self.__load(device_type)

    def __get(self, device_type: DeviceType, name: str):
        try:
            return self.__devices[device_type][name]
        except KeyError:
            raise DeviceNotFoundException(device_type, name)

    def __load(self, device_type: DeviceType):
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
    def __init__(self, device_type: DeviceType, name: str):
        message = f'Cannot find {device_type} "{name}"'
        Exception.__init__(self, message)
