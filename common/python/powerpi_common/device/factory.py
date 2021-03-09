from powerpi_common.logger import Logger


class DeviceFactory(object):
    def __init__(self, logger: Logger, service_provider):
        self.__logger = logger
        self.__service_provider = service_provider

    def build(self, device_type, **kwargs):
        device_attribute = '{}_device'.format(device_type)

        try:
            factory = getattr(self.__service_provider, device_attribute)

            return factory(**kwargs)
        except AttributeError:
            self.__logger.debug(
                'Could not find device type "{}"'.format(device_type)
            )

        return None
