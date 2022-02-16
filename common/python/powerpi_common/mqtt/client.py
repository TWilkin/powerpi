import json
import socket
import sys
import time

from datetime import datetime
from gmqtt import Client, constants as MqttConstants
from typing import Dict, List
from urllib.parse import urlparse

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .consumer import MQTTConsumer
from .types import MQTTMessage


class MQTTClient(object):
    __consumers: Dict[str, List[MQTTConsumer]]

    def __init__(
        self,
        app_name: str,
        config: Config,
        logger: Logger
    ):
        self.__config = config
        self.__logger = logger
        self.__app_name = app_name
        self.__consumers = {}
        self.__connected = False

    def add_consumer(self, consumer: MQTTConsumer):
        key = consumer.topic

        new_topic = False
        if not key in self.__consumers:
            self.__consumers[key] = []
            new_topic = True

        self.__consumers[key].append(consumer)

        if new_topic:
            topic = '{}/{}'.format(self.__config.topic_base, key)
            self.__logger.info(f'Subcribing to topic "{topic}"')
            self.__client.subscribe(topic)

    def remove_consumer(self, consumer: MQTTConsumer):
        key = consumer.topic

        if key in self.__consumers:
            self.__consumers[key].remove(consumer)

        if len(self.__consumers.get(key, [])) == 0:
            topic = '{}/{}'.format(self.__config.topic_base, key)
            self.__logger.info(f'Unsubcribing from topic "{topic}"')
            self.__client.unsubscribe(topic)

    def add_producer(self):
        def publish(topic, message):
            # add the timestamp to the message
            message['timestamp'] = int(datetime.utcnow().timestamp() * 1000)

            topic = f'{self.__config.topic_base}/{topic}'

            return self.__publish(topic, message)
        return publish

    async def connect(self):
        if self.__config.mqtt_address is None:
            error = 'Cannot connect to MQTT, no address specified'
            self.__logger.error(error)
            raise EnvironmentError(error)

        client_id = f'{self.__app_name}-{socket.gethostname()}'.lower()

        self.__logger.info(
            f'Connecting to MQTT at "{self.__config.mqtt_address}" as "{client_id}"'
        )

        url = urlparse(self.__config.mqtt_address)
        self.__client = Client(client_id)
        self.__client.on_connect = self.__on_connect
        self.__client.on_disconnect = self.__on_disconnect
        self.__client.on_message = self.__on_message
        self.__client.on_log = self.__on_log
        await self.__client.connect(url.hostname, url.port, version=MqttConstants.MQTTv311)

    def __on_connect(self, _, __, ___, result_code: int):
        if result_code == 0:
            self.__connected = True
            self.__logger.info('MQTT connected')
        else:
            self.__logger.error(f'MQTT connection failed with code {result_code}')
            return

    def __on_disconnect(self, _, __, result_code: int):
        self.__connected = False

        if result_code == 0:
            self.__logger.info('MQTT disconnected')
        else:
            self.__logger.error(f'MQTT disconnected with code {result_code}')

    async def __on_message(self, _, topic: str, payload: Dict, __, ___):
        # read the JSON
        message: MQTTMessage = json.loads(payload)
        self.__logger.debug(f'Received: {topic}:{json.dumps(message)}')

        # split the topic
        _, message_type, entity, action = topic.split('/', 3)

        # define the listener this was registered for
        listener_key = f'{message_type}/{entity}/{action}'

        # send the message to the correct consumers
        if listener_key in self.__consumers:
            for consumer in self.__consumers[listener_key]:
                try:
                    await consumer.on_message(message, entity, action)
                except Exception as ex:
                    self.__logger.error(Exception(f'{type(consumer)}.on_message', ex))
        
        return MqttConstants.PubRecReasonCode.SUCCESS

    def __on_log(self, _, __, level: str, payload: Dict):
        self.__logger.debug(f'MQTT({level}): {payload}')

    def __publish(self, topic: str, payload: Dict):
        self.__wait_for_connection()

        message = json.dumps(payload)
        self.__logger.info(f'Publishing {topic}:{message}')
        self.__client.publish(topic, message, qos=2, retain=True)

    def __wait_for_connection(self):
        counter = 0
        while not self.__connected:
            time.sleep(1)

            counter += 1
            if counter == self.__config.mqtt_connect_timeout:
                self.__logger.error('Giving up connecting to MQTT')
                sys.exit(-1)
