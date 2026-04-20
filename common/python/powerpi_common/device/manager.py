from copy import deepcopy

from powerpi_common.config import Config
from powerpi_common.device.types import DeviceConfigType
from powerpi_common.logger import Logger
from powerpi_common.sensor import Sensor
from powerpi_common.util import ismixin

from .device import Device
from .factory import DeviceFactory
from .mixin import InitialisableMixin

DeviceOrSensor = Device | Sensor


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

        self.__devices: dict[
            DeviceConfigType,
            dict[str, DeviceOrSensor]
        ] = {}

        for device_type in DeviceConfigType:
            self.__devices[device_type] = {}

    @property
    def devices_and_sensors(self) -> list[DeviceOrSensor]:
        return list(self.devices.values()) + list(self.sensors.values())

    @property
    def devices(self) -> dict[str, Device]:
        return self.__devices[DeviceConfigType.DEVICE]

    @property
    def sensors(self) -> dict[str, Sensor]:
        return self.__devices[DeviceConfigType.SENSOR]

    def get_device(self, name: str) -> Device:
        return self.__get(DeviceConfigType.DEVICE, name)

    def get_sensor(self, name: str) -> Sensor:
        return self.__get(DeviceConfigType.SENSOR, name)

    async def load(self):
        for device_type in DeviceConfigType:
            self.__load(device_type)

        await self.initialise()

    async def initialise(self):
        # initialise the geofences for all the devices
        for device in [
            device for device in self.__devices[DeviceConfigType.DEVICE].values()
            if isinstance(device, Device)
        ]:
            await device.geofence.initialise()

        for device_type in DeviceConfigType:
            filtered = filter(
                lambda device: ismixin(device, InitialisableMixin),
                self.__devices[device_type].values()
            )

            for device in filtered:
                await device.initialise()

    async def deinitialise(self):
        for device_type in DeviceConfigType:
            filtered = filter(
                lambda device: ismixin(device, InitialisableMixin),
                self.__devices[device_type].values()
            )

            for device in filtered:
                await device.deinitialise()

    def __get(self, device_type: DeviceConfigType, name: str):
        try:
            return self.__devices[device_type][name]
        except KeyError as ex:
            raise DeviceNotFoundException(device_type, name) from ex

    def __load(self, device_type: DeviceConfigType):
        devices: list[dict[str, any]] \
            = self.__config.devices[f'{device_type}s']

        for device in devices:
            instance_type = device['type']

            device_args = deepcopy(device)
            del device_args['type']

            instance = self.__factory.build(
                device_type, instance_type, **device_args
            )

            if instance is not None:
                self.__logger.info(f'Found {instance}')

                self.__devices[device_type][device['name']] = instance

        self.__logger.info(
            f'Found {len(self.__devices[device_type])} matching {device_type}(s)'
        )


class DeviceNotFoundException(Exception):
    def __init__(self, device_type: DeviceConfigType, name: str):
        message = f'Cannot find {device_type} "{name}"'
        Exception.__init__(self, message)
