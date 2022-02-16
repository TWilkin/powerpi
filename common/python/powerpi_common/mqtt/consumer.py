from abc import abstractmethod
from datetime import datetime

from powerpi_common.config import Config
from powerpi_common.logger import Logger


class MQTTConsumer:

    def __init__(self, topic: str, config: Config, logger: Logger):
        self._topic = topic
        self._config = config
        self._logger = logger

    @property
    def topic(self):
        return self._topic

    @abstractmethod
    async def on_message(self, client, user_data, message, entity, action):
        raise NotImplementedError

    def is_timestamp_valid(self, timestamp):
        # check age of message is within cutoff
        now = int(datetime.utcnow().timestamp() * 1000)
        if timestamp < now - (self._config.message_age_cutoff * 1000):
            self._logger.info('Ignoring old message')
            return False

        return True
