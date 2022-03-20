from abc import ABC, abstractmethod
from datetime import datetime
from typing import Union

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .types import MQTTMessage


class MQTTConsumer(ABC):
    def __init__(self, topic: str, config: Config, logger: Logger):
        self._topic = topic
        self._config = config
        self._logger = logger

    @property
    def topic(self):
        return self._topic

    @abstractmethod
    async def on_message(self, message: MQTTMessage, entity: str, action: str):
        raise NotImplementedError

    def is_timestamp_valid(self, timestamp: Union[int, None]):
        # check age of message is within cutoff
        now = int(datetime.utcnow().timestamp() * 1000)
        if timestamp < now - (self._config.message_age_cutoff * 1000):
            self._logger.info('Ignoring old message')
            return False

        return True
