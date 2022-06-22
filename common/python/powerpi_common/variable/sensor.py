from collections import namedtuple

from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


SensorValue = namedtuple('SensorValue', 'value unit')


class SensorVariable(Variable):
    def __init__(
        self,
        _: MQTTClient,
        **kwargs
    ):
        Variable.__init__(self, **kwargs)

        self.__value = SensorValue(None, None)

    @property
    def variable_type(self):
        return VariableType.SENSOR

    @property
    def value(self):
        return self.__value

    @value.setter
    def value(self, new_value: float, new_unit: str):
        self.__value = SensorValue(new_value, new_unit)

    @property
    def json(self):
        return {'value': self.__value.value, 'unit': self.__value.unit}
