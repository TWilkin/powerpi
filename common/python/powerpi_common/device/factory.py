from powerpi_common.logger import Logger


class DeviceFactory(object):
    def __init__(self, logger: Logger, service_provider):
        self.__logger = logger
        self.__service_provider = service_provider

    def build(self, device_type, **kwargs):
        device_attribute = f'{device_type}_device'

        try:
            factory = getattr(self.__service_provider, device_attribute)

            return factory(**kwargs)
        except AttributeError:
            self.__logger.debug(f'Could not find device type "{device_type}"')

        return None
