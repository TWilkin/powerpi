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
            self, f'sensor/{name}/{action}', self, config, logger
        )

        self.__value = SensorValue(None, None)

        mqtt_client.add_consumer(self)

    @property
    def variable_type(self):
        return VariableType.SENSOR

    @property
    def value(self):
        return self.__value

    @value.setter
    def value(self, new_tuple: Tuple[float, str]):
        new_value, new_unit = new_tuple
        self.__value = SensorValue(new_value, new_unit)

    @property
    def json(self):
        return {'value': self.__value.value, 'unit': self.__value.unit}
