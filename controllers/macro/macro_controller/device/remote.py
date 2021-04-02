from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class RemoteDevice(object):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        **kwargs
    ):
        self.__config = config
        self.__logger = logger
        self.__mqtt_client = mqtt_client
        self.__name = name
        self.__state = 'unknown'

    @property
    def name(self):
        return self.__name

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state):
        self.__state = new_state

    def poll(self):
        pass

    def turn_on(self):
        pass

    def turn_off(self):
        pass

    def __str__(self):
        return '{}({}, {})'.format(type(self).__name__, self.__name, self.__state)
