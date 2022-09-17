from copy import deepcopy

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTConsumer, MQTTMessage
from powerpi_common.typing import SensorType


class SensorInitialStatusEventConsumer(MQTTConsumer):
    def __init__(
        self,
        sensor: SensorType,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient
    ):
        topic = f'event/{sensor.name}/{sensor.action}'

        MQTTConsumer.__init__(self, topic, config, logger)

        self.__sensor = sensor
        self.__active = True

        self.__mqtt_client = mqtt_client
        self.__mqtt_client.add_consumer(self)

    async def on_message(self, message: MQTTMessage, entity: str, _: str):
        if self.__active and entity == self.__sensor.name:
            # delete the timestamp
            new_state = deepcopy(message)
            new_state.pop('timestamp', None)

            self.__sensor.state = new_state

            # remove this consumer as it has completed its job
            self.__active = False
            self.__mqtt_client.remove_consumer(self)
