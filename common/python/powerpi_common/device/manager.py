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

        self.__devices: dict[str, BaseDevice] = {}
        self.__sensors: dict[str, BaseDevice] = {}

    @property
    def devices(self):
        return self.__devices

    @property
    def sensors(self):
        return self.__sensors

    def get_device(self, name):
        if self.__devices[name]:
            return self.__devices[name]

        raise Exception(f'Cannot find device "{name}"')

    def get_sensor(self, name):
        if self.__sensors[name]:
            return self.__sensors[name]

        raise Exception(f'Cannot find sensor "{name}"')
    
    def load(self):
        self.__load(DeviceType.DEVICE)
        self.__load(DeviceType.SENSOR)        

    def __load(self, device_type: DeviceType):
        instances = {}

        if device_type == DeviceType.DEVICE:
            self.__devices = instances
        else:
            self.__sensors = instances

        devices: List[Dict[str, Any]] = self.__config.devices[f'{device_type}s']

        for device in devices:
            instance_type = device['type']

            device_args = deepcopy(device)
            del device_args['type']

            instance = self.__factory.build(device_type, instance_type, **device_args)
            if instance is not None:
                self.__logger.info(f'Found {instance}')

                instances[device['name']] = instance

        self.__logger.info(f'Found {len(instances)} matching {device_type}(s)')
