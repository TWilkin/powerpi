import json
import logging
import socket
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

import gmqtt
from gmqtt import Client

from powerpi_common.config import Config
from powerpi_common.logger import Logger

from .consumer import MQTTConsumer
from .types import MQTTConsumerPriority, MQTTMessage


class MQTTClient:
    __consumers: dict[str, dict[MQTTConsumerPriority, list[MQTTConsumer]]]

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

        self.__logger.set_logger_level(gmqtt.__name__, logging.WARNING)

        self.__client = Client | None

    @property
    def client_id(self):
        return f'{self.__app_name}-{socket.gethostname()}'.lower()

    @property
    def connected(self):
        return self.__connected

    def add_consumer(
        self,
        consumer: MQTTConsumer,
        priority: MQTTConsumerPriority = MQTTConsumerPriority.VALUE
    ):
        key = consumer.topic

        if key not in self.__consumers:
            self.__consumers[key] = {}
        if priority not in self.__consumers[key]:
            self.__consumers[key][priority] = []

        self.__consumers[key][priority].append(consumer)

    def remove_consumer(self, consumer: MQTTConsumer):
        key = consumer.topic

        if key in self.__consumers:
            for priority in MQTTConsumerPriority:
                if priority in self.__consumers[key] \
                        and consumer in self.__consumers[key][priority]:
                    self.__consumers[key][priority].remove(consumer)

            if all(len(consumers) == 0 for consumers in self.__consumers[key].values()):
                topic = f'{self.__config.topic_base}/{key}'
                self.__logger.info('Unsubscribing from topic "%s"', topic)
                self.__client.unsubscribe(topic)

    def add_producer(self):
        def publish(topic: str, message: MQTTMessage):
            # add the timestamp to the message
            message['timestamp'] = int(
                datetime.now(timezone.utc).timestamp() * 1000
            )

            topic = f'{self.__config.topic_base}/{topic}'

            self.__publish(topic, message)
        return publish

    async def connect(self):
        if self.__config.mqtt_address is None:
            error = 'Cannot connect to MQTT, no address specified'
            self.__logger.error(error)
            raise EnvironmentError(error)

        client_id = self.client_id

        self.__logger.info(
            'Connecting to MQTT at "%s" as "%s"',
            self.__config.mqtt_address,
            self.__config.mqtt_user if self.__config.mqtt_user is not None else 'anonymous'
        )

        url = urlparse(self.__config.mqtt_address)
        self.__client = Client(client_id)

        if self.__config.mqtt_user:
            self.__client.set_auth_credentials(
                self.__config.mqtt_user,
                self.__config.mqtt_password
            )

        self.__client.set_config({
            'reconnect_retries': 0
        })

        self.__client.on_connect = self.__on_connect
        self.__client.on_disconnect = self.__on_disconnect
        self.__client.on_message = self.__on_message

        await self.__client.connect(
            url.hostname,
            url.port,
            ssl=True if url.scheme == 'mqtts' else False,
            version=gmqtt.constants.MQTTv311
        )

    async def disconnect(self):
        self.__logger.info('Disconnecting from MQTT')
        await self.__client.disconnect()

    def subscribe(self):
        for key in self.__consumers:
            topic = f'{self.__config.topic_base}/{key}'
            self.__logger.info('Subscribing to topic "%s"', topic)
            self.__client.subscribe(topic)

    def __on_connect(self, _, __, result_code: int, ___):
        if result_code == 0:
            self.__connected = True
            self.__logger.info('MQTT connected as %s', self.client_id)
        else:
            self.__logger.error(
                'MQTT connection failed with code %d',
                result_code
            )

    def __on_disconnect(self, _, __):
        self.__connected = False
        self.__logger.info('MQTT disconnected')
        sys.exit(-1)

    async def __on_message(self, _, topic: str, payload: dict, __, ___):
        # read the JSON
        message: MQTTMessage = json.loads(payload)
        self.__logger.debug('Received: %s:%s', topic, json.dumps(message))

        # split the topic
        _, message_type, entity, action = topic.split('/', 3)

        # define the listener this was registered for
        listener_key = f'{message_type}/{entity}/{action}'

        # send the message to the correct consumers
        if listener_key in self.__consumers:
            for priority in MQTTConsumerPriority:
                if priority in self.__consumers[listener_key]:
                    for consumer in self.__consumers[listener_key][priority]:
                        # pylint: disable=broad-except
                        try:
                            await consumer.on_message(message, entity, action)
                        except Exception as ex:
                            self.__logger.exception(
                                MQTTMessageException(consumer, ex)
                            )

        return gmqtt.constants.PubRecReasonCode.SUCCESS

    def __publish(self, topic: str, payload: MQTTMessage):
        self.__wait_for_connection()

        message = json.dumps(payload)
        self.__logger.info('Publishing %s:%s', topic, message)
        self.__client.publish(topic, message, qos=2, retain=True)

    def __wait_for_connection(self):
        counter = 0
        while not self.__connected:
            time.sleep(1)

            counter += 1
            if counter == self.__config.mqtt_connect_timeout:
                self.__logger.error('Giving up connecting to MQTT')
                sys.exit(-1)


class MQTTMessageException(Exception):
    def __init__(self, consumer: MQTTConsumer, ex: Exception):
        Exception.__init__(self, f'{type(consumer)}.on_message', ex)
