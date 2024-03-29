import asyncio
import os

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTConsumer, MQTTMessage

from .config import Config


class ConfigRetriever:
    '''
    Service to retrieve configuration files from the message queue.
    '''

    def __init__(self, config: Config, logger: Logger, mqtt_client: MQTTClient):
        self.__config = config
        self.__logger = logger
        self.__mqtt_client = mqtt_client

    async def start(self):
        # subscribe to change topic for each file type
        for file_type in self.__config.used_config:
            topic = f'config/{file_type}/change'
            consumer = ConfigConsumer(topic, self.__config, self.__logger)
            self.__mqtt_client.add_consumer(consumer)

        # wait until we have the config
        if self.__config.config_is_needed:
            self.__logger.info('Waiting for configuration from queue')
            success = await self.__wait_for_config()

            if success:
                self.__logger.info('Retrieved all expected config from queue')
            else:
                error = 'Failed to retrieve all expected config from queue'
                self.__logger.error(error)
                raise EnvironmentError(error)

    async def __wait_for_config(self):
        interval = 1  # seconds
        wait_time = self.__config.config_wait_time / interval

        while wait_time > 0:
            if self.__config.is_populated:
                return True

            wait_time -= 1

            await asyncio.sleep(interval)


class ConfigConsumer(MQTTConsumer):
    '''
    MQTT consumer for configuration files in the message queue.
    '''

    def __init__(self, topic: str, config: Config, logger: Logger):
        MQTTConsumer.__init__(
            self, topic, config, logger
        )

    async def on_message(self, message: MQTTMessage, entity: str, _):
        self._logger.info(f'Received config for {entity}')

        if self._config.config_is_needed \
                and entity in self._config.used_config \
                and self._config.get_config(entity) is not None:
            # this is a changed config and used, so we should restart the service
            self._logger.info(
                f'Restarting service due to changed {entity} config'
            )

            # pylint: disable=protected-access
            os._exit(0)
        else:
            # this is a new or unused config, so just set it
            self._config.set_config(entity, message.get('payload'))
