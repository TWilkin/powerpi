from threading import Event

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, StatusEventConsumer


class RemoteDevice(StatusEventConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        **kwargs
    ):
        self.__logger = logger
        self.__name = name

        StatusEventConsumer.__init__(self, self, config, logger)

        self.__state = 'unknown'
        self.__producer = mqtt_client.add_producer()
        self.__waiting = Event()

        mqtt_client.add_consumer(self)

    @property
    def name(self):
        return self.__name

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: str):
        self.__state = new_state
        self.__waiting.set()

    def poll(self):
        pass

    def set_state_and_additional(self, state: str, _: dict):
        self.state = state

    def turn_on(self):
        self.__send_message('on')

    def turn_off(self):
        self.__send_message('off')

    def __send_message(self, state: str):
        topic = 'device/{}/change'.format(self.__name)

        self.__producer(topic, {'state': state})

        self.__logger.info(
            f'Waiting for state update for device "{self.__name}"'
        )

        self.__waiting.clear()
        while not self.__waiting.is_set():
            self.__waiting.wait(12.5)

        self.__logger.info(
            f'Continuing after device "{self.__name}"'
        )

    def __str__(self):
        return '{}({}, {})'.format(type(self).__name__, self.__name, self.__state)
