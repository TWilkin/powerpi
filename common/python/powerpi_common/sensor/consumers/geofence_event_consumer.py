from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTConsumer, MQTTMessage, MQTTTopic
from powerpi_common.typing import SensorType


class GeofenceEventConsumer(MQTTConsumer):
    '''
    Consumer for reading geofence events.
    '''

    def __init__(
        self,
        entity: str,
        sensor: SensorType,
        config: Config,
        logger: Logger
    ):
        topic = f'{MQTTTopic.GEOFENCE}/{entity}/status'
        MQTTConsumer.__init__(self, topic, config, logger)

        self._sensor = sensor

    async def on_message(self, message: MQTTMessage, _: str, __: str):
        state = message.get('state')

        if state is not None:
            self._sensor.state = state
