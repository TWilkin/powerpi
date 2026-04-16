from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import PresenceStatus
from powerpi_common.sensor.consumers import PresenceEventConsumer
from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


class PresenceVariable(Variable, PresenceEventConsumer):
    '''
    Variable implementation that will receive presence detection events from the message queue.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        **kwargs
    ):
        Variable.__init__(self, name, **kwargs)
        PresenceEventConsumer.__init__(
            self,
            name,
            self,
            config,
            logger
        )

        self.__state: PresenceStatus | None = None

        mqtt_client.add_consumer(self)

    @property
    def variable_type(self):
        return VariableType.PRESENCE

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: str):
        self.__state = new_state

    @property
    def json(self):
        return {'state': self.__state}

    @property
    def suffix(self):
        return f'{self._name}'
