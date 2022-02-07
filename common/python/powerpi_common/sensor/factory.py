from powerpi_common.logger import Logger


class SensorFactory(object):
    def __init__(self, logger: Logger, service_provider):
        self.__logger = logger
        self.__service_provider = service_provider

    def build(self, sensor_type, **kwargs):
        sensor_attribute = f'{sensor_type}_sensor'

        try:
            factory = getattr(self.__service_provider, sensor_attribute)

            return factory(**kwargs)
        except AttributeError:
            self.__logger.debug(f'Could not find sensor type "{sensor_type}"')

        return None
