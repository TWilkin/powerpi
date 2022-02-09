from typing import List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTConsumer
from .handler import EventHandler


class EventConsumer(MQTTConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        topic: str,
        events: List[EventHandler]
    ):
        MQTTConsumer.__init__(self, topic, config, logger)

        self.__events = events

    def on_message(self, client, user_data, message: dict, entity, action):
        for event in self.__events:
            if event.execute(message):
                self._logger.info(f'Condition match for "{self}"')
                return

    def __str__(self):
        events = ', '.join([event.__str__() for event in self.__events])
        return f'{self._topic}({events})'
