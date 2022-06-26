from collections import namedtuple
from typing import Tuple

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor.consumers import SensorEventConsumer
from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


SensorValue = namedtuple('SensorValue', 'value unit')


class SensorVariable(Variable, SensorEventConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        action: str,
        **kwargs
    ):
        Variable.__init__(self, name, **kwargs)
        SensorEventConsumer.__init__(
            self, f'event/{name}/{action}', self, config, logger
        )

        self.__action = action
        self.__value = SensorValue(None, None)
        self.__state = None

        mqtt_client.add_consumer(self)

    @property
    def variable_type(self):
        return VariableType.SENSOR

    @property
    def action(self):
        return self.__action

    @property
    def value(self):
        return self.__value

    @value.setter
    def value(self, new_tuple: Tuple[float, str]):
        new_value, new_unit = new_tuple
        self.__value = SensorValue(new_value, new_unit)

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: str):
        self.__state = new_state

    @property
    def json(self):
        result = {}

        if self.__value.value is not None or self.__value.unit is not None:
            result['value'] = self.__value.value
            result['unit'] = self.__value.unit
        if self.__state is not None:
            result['state'] = self.__state

        return result

    @property
    def suffix(self):
        return f'{self._name}.{self.__action}'
