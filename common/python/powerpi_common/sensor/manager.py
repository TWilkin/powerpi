from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .factory import SensorFactory


class SensorManager(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        factory: SensorFactory
    ):
        self.__config = config
        self.__logger = logger
        self.__factory = factory

        self.__sensors = {}
    
    @property
    def sensors(self):
        self.__sensors
    
    def get_sensor(self, name):
        if self.__sensors[name]:
            return self.__sensors[name]
        
        raise Exception(f'Cannot find sensor "{name}"')
    
    def load(self):
        sensors = self.__config.devices['sensors']

        self.__sensors = {}
        for sensor in sensors:
            sensor_type = sensor['type']
            del sensor['type']

            instance = self.__factory.build(sensor_type, **sensor)
            if instance is not None:
                self.__logger.info(f'Found {instance}')

                self.__sensors[sensor['name']] = instance
        
        self.__logger.info(f'Found {len(self.__sensors)} matching sensors')
