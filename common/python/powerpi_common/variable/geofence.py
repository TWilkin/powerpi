from powerpi_common.config import Config
from powerpi_common.device import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor.consumers import GeofenceEventConsumer
from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


class GeofenceVariable(Variable, GeofenceEventConsumer):
    '''
    Variable implementation that will receive geofence activation events from the message queue.
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
        GeofenceEventConsumer.__init__(
            self,
            name,
            self,
            config,
            logger
        )

        self.__state: DeviceStatus = DeviceStatus.UNKNOWN

        mqtt_client.add_consumer(self)

    @property
    def variable_type(self):
        return VariableType.PRESENCE

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: DeviceStatus):
        self.__state = new_state

    @property
    def json(self):
        return {'state': self.__state}

    @property
    def suffix(self):
        return f'{self._name}'
