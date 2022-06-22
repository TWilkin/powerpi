from powerpi_common.config import Config
from powerpi_common.device import DeviceStatus
from powerpi_common.device.consumers import DeviceStatusEventConsumer
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


class DeviceVariable(Variable, DeviceStatusEventConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Variable.__init__(self, **kwargs)
        DeviceStatusEventConsumer.__init__(self, self, config, logger)

        self.__state = DeviceStatus.UNKNOWN

        mqtt_client.add_consumer(self)

    @property
    def variable_type(self):
        return VariableType.DEVICE

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: str):
        self.__state = new_state

    @property
    def json(self):
        return {'state': self.__state}
