from abc import abstractmethod

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, StatusEventConsumer, PowerEventConsumer


class Device(PowerEventConsumer):
    class __StatusEventConsumer(StatusEventConsumer):
        def __init__(self, device, mqtt_client: MQTTClient):
            StatusEventConsumer.__init__(
                self, device, device._config, device._logger
            )
            self.__mqtt_client = mqtt_client

            mqtt_client.add_consumer(self)

        def _update_device(self, new_state):
            # override default behaviour to prevent events generated for state change
            self._device._update_state_no_broadcast(new_state)

            # remove this consumer as it has completed its job
            self.__mqtt_client.remove_consumer(self)

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        display_name: str = None,
        visible: bool = False
    ):
        self._name = name
        self._display_name = display_name if display_name is not None else name

        PowerEventConsumer.__init__(self, self, config, logger)

        self._logger = logger
        self.__state = 'unknown'

        self._producer = mqtt_client.add_producer()

        mqtt_client.add_consumer(self)

        self.__StatusEventConsumer(self, mqtt_client)

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
            'Turning on device {}'.format(self))
        self._turn_on()
        self.state = 'on'

    def turn_off(self):
        self._logger.info(
            'Turning off device {}'.format(self))
        self._turn_off()
        self.state = 'off'

    @abstractmethod
    def poll(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError

    def _update_state_no_broadcast(self, new_state):
        self.__state = new_state

    def __str__(self):
        return '{}({}, {})'.format(type(self).__name__, self._display_name, self.__state)
