import json
import paho.mqtt.client as mqtt

from datetime import datetime
from dependency_injector.wiring import Provide
from urllib.parse import urlparse

from common.config import Config
from common.logger import Logger


class MQTTClient(object):

    def __init__(
        self,
        config: Config,
        logger: Logger
    ):
        self.__config = config
        self.__logger = logger

        self.__connect()

    def loop(self):
        self.__client.loop_forever()

    def __connect(self):
        if self.__config.mqtt_address is None:
            error = 'Cannot connect to MQTT, no address specified'
            self.__logger.error(error)
            raise EnvironmentError(error)

        self.__logger.info('Connecting to MQTT at {:s}'
                           .format(self.__config.mqtt_address))

        url = urlparse(self.__config.mqtt_address)
        self.__client = mqtt.Client()
        self.__client.on_connect = self.__on_connect
        self.__client.on_message = self.__on_message
        self.__client.connect(url.hostname, url.port, 60)

    def __on_connect(self, _, __, ___, result_code):
        self.__logger.info('MQTT Connected {:d}'.format(result_code))

    def __on_message(self, client, user_data, message):
        # read the JSON
        event = json.loads(message.payload)
        self.__logger.info('Received: {:s}:{:s}'
                           .format(message.topic, json.dumps(event)))
