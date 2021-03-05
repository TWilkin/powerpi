from abc import abstractmethod

from .config import Config
from .logger import Logger
from .mqtt import MQTTClient, PowerEventConsumer


class Device(PowerEventConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str
    ):
        self._name = name
        PowerEventConsumer.__init__(self, self, config, logger)

        self._logger = logger
        self.__state = 'unknown'

        self._producer = mqtt_client.add_producer()

        mqtt_client.add_consumer(self)

    @property
    def name(self):
        return self._name

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state):
        self.__state = new_state

        self._logger.info(
            'Device "{}" now has state {}'.format(self._name, self.__state)
        )

        # broadcast the state change
        topic = '{}/{}/{}'.format('device', self._name, 'status')
        message = {'state': self.__state}
        self._producer(topic, message)

    def turn_on(self):
        self._logger.info(
            'Turning on socket "{name}"'.format(name=self._name))
        self._turn_on()
        self.state = 'on'

    def turn_off(self):
        self._logger.info(
            'Turning off socket "{name}"'.format(name=self._name))
        self._turn_off()
        self.state = 'off'

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError
