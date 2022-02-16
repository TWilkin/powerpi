from typing import List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTConsumer, MQTTMessage
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

    async def on_message(self, message: MQTTMessage, _, __):
        try:
            if not super().is_timestamp_valid(message['timestamp']):
                return
        except:
            # if there is no timestamp that's not an error
            pass
        
        for event in self.__events:
            complete = await event.execute(message)

            if complete:
                self._logger.info(f'Condition match for "{self}"')
                return

    def __str__(self):
        events = ', '.join([event.__str__() for event in self.__events])
        return f'{self._topic}({events})'
