from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTConsumer, MQTTMessage
from powerpi_common.typing import SensorType


class SensorEventConsumer(MQTTConsumer):
    def __init__(
        self,
        topic: str,
        sensor: SensorType,
        config: Config,
        logger: Logger
    ):
        MQTTConsumer.__init__(self, topic, config, logger)

        self._sensor = sensor

    async def on_message(self, message: MQTTMessage, entity: str, action: str):
        value = message.get('value')
        unit = message.get('unit')
        state = message.get('state')

        if value is not None and unit is not None:
            value = float(value)
            self._sensor.value = (value, unit)

        if state is not None:
            self._sensor.state = state
