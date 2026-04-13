from powerpi_common.condition import ConditionParser, Expression
from powerpi_common.device import DeviceStatus
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common.variable import VariableManager


class GeofenceSensor(Sensor, InitialisableMixin):
    '''
    Sensor implementing the conditions to activate, or deactivate a Geofence.
    A Geofence is a conditional sensor which outputs "on" or "off" depending
    on whether the condition is true or false. It is expected that the condition
    include presence sensors; but is otherwise user configurable.
    e.g.:
    {
        'either': [
            {'var': 'presence.Person1.state', 'present'},
            {'var': 'presence.Person2.state', 'present'}
        ]
    }
    '''

    def __init__(
        self,
        logger: Logger,
        mqtt_client: MQTTClient,
        variable_manager: VariableManager,
        condition: Expression,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)

        self._logger = logger

        self.__variable_manager = variable_manager
        self.__condition = condition

        self.__state = DeviceStatus.UNKNOWN

    @property
    def state(self):
        return self.__state

    async def initialise(self):
        # we evaluate the condition during initialisation to ensure
        # the variable manager is monitoring the referenced devices/sensors
        self.__check_condition()

    def on_message(self):
        # first we check the condition to identify what state we are in
        condition = self.__check_condition()
        new_state = DeviceStatus.ON if condition else DeviceStatus.OFF

        # if the state has changed, then we need to broadcast that
        if new_state != self.__state:
            self.__state = new_state

            self.__broadcast(new_state)

    def __check_condition(self):
        parser = ConditionParser(self.__variable_manager, {})
        return parser.conditional_expression(self.__condition)

    def __broadcast(self, state: DeviceStatus):
        topic = f'geofence/{self.entity}/status'

        message = {'state': state}

        self._producer(topic, message)
