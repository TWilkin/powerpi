from powerpi_common.condition import ConditionParser, ConditionVisitor, Expression
from powerpi_common.config import Config
from powerpi_common.device import DeviceStatus
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import (
    MQTTClient,
    MQTTConsumer,
    MQTTConsumerPriority,
    MQTTMessage,
    MQTTTopic
)
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
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        variable_manager: VariableManager,
        condition: Expression,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)

        self._config = config
        self._logger = logger

        self.__mqtt_client = mqtt_client
        self.__variable_manager = variable_manager
        self.__condition = condition

        self.__state = DeviceStatus.UNKNOWN

    @property
    def state(self):
        return self.__state

    async def initialise(self):
        # we need the list of variables, to register listeners
        visitor = self._Visitor()
        visitor.visit(self.__condition)
        variables = visitor.variables
        self.log_info('Found variables %s', variables)

        # now we need to add the listeners
        consumer: MQTTConsumer | None = None
        for key, states in variables.items():
            for state in states:
                if key[0] == 'device':
                    consumer = self.__add_device_listener(key[1], state)
                elif key[0] == 'sensor':
                    consumer = self.__add_sensor_listener(key[1], state)
                elif key[0] == 'presence':
                    consumer = self.__add_presence_listener(key[1], state)

                if consumer is not None:
                    self.__mqtt_client.add_consumer(
                        consumer, MQTTConsumerPriority.LOGIC)

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
        topic = f'{MQTTTopic.GEOFENCE}/{self.entity}/status'

        message = {'state': state}

        self._producer(topic, message)

    def __add_device_listener(self, entity: str, value: list[str]):
        prop = value[0]
        action: str | None = None

        if prop == 'state':
            action = 'status'

        if action is not None:
            return self._EventConsumer(self, MQTTTopic.DEVICE, entity, action)

        return None

    def __add_sensor_listener(self, entity: str, value: list[str]):
        action = value[0]

        if action is not None:
            return self._EventConsumer(self, MQTTTopic.EVENT, entity, action)

        return None

    def __add_presence_listener(self, entity: str, value: list[str]):
        prop = value[0]
        action: str | None = None

        if prop == 'state':
            action = 'status'

        if action is not None:
            return self._EventConsumer(self, MQTTTopic.PRESENCE, entity, action)

        return None

    class _Visitor(ConditionVisitor):
        def __init__(self):
            self.__variables: dict[tuple[str, str], list[str]] = {}

        @property
        def variables(self):
            return self.__variables

        def visit_var(self, identifier: str):
            split = identifier.split('.')
            var_type = split[0]

            # messages make no sense for geofence condition
            if var_type == 'message':
                return

            entity = split[1]
            data = split[2]  # either the property or the action
            # we drop the prop for sensors as we don't monitor that granularity

            key = (var_type, entity)

            record = self.__variables.setdefault(key, [])
            if data not in record:
                record.append(data)

    class _EventConsumer(MQTTConsumer):
        def __init__(
            self,
            owner: 'GeofenceSensor',
            entity_type: str,
            entity: str,
            action: str,
        ):
            topic = f'{entity_type}/{entity}/{action}'
            MQTTConsumer.__init__(self, topic, owner._config, owner._logger)

            self.__entity_type = entity_type
            self.__owner = owner

        async def on_message(self, message: MQTTMessage, entity: str, action: str):
            if self.is_timestamp_valid(message.timestamp):
                self.__owner.on_message(self.__entity_type)
