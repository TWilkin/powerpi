from powerpi_common.logger import Logger
from .base import BaseDevice
from .type import DeviceType


class DeviceFactory(object):
    def __init__(self, logger: Logger, service_provider):
        self.__logger = logger
        self.__service_provider = service_provider

    def build(self, device_type: DeviceType, instance_type: str, **kwargs) -> BaseDevice:
        key = 'device' if device_type == DeviceType.DEVICE else 'sensor'

        device_attribute = f'{instance_type}_{key}'

        try:
            factory = getattr(self.__service_provider, device_attribute)

            return factory(**kwargs)
        except AttributeError:
            self.__logger.debug(f'Could not find {key} type "{instance_type}"')

        return None
