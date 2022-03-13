from typing import Union

from powerpi_common.logger import Logger
from powerpi_common.typing import DeviceType, SensorType
from .types import DeviceConfigType


class DeviceFactory:
    def __init__(self, logger: Logger, service_provider):
        self.__logger = logger
        self.__service_provider = service_provider

    def build(
        self,
        device_type: DeviceConfigType,
        instance_type: str,
        **kwargs
    ) -> Union[DeviceType, SensorType]:
        device_attribute = f'{instance_type}_{device_type}'

        factory = getattr(self.__service_provider, device_attribute, None)

        if factory is None:
            self.__logger.debug(
                f'Could not find {device_type} type "{instance_type}"'
            )
            return None

        return factory(**kwargs)
