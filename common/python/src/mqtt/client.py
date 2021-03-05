import json
import paho.mqtt.client as mqtt

from datetime import datetime
from urllib.parse import urlparse

from ..config import Config
from ..logger import Logger
from . consumer import MQTTConsumer


class MQTTClient(object):

    def __init__(
        self,
        app_name: str,
        config: Config,
        logger: Logger
    ):
        self.__config = config
        self.__logger = logger
        self.__app_name = app_name
        self.__consumers: dict(str, MQTTConsumer) = {}

        self.__connect()

    def add_consumer(self, consumer: MQTTConsumer):
        key = consumer.topic

        if not key in self.__consumers:
            self.__consumers[key] = []

        self.__consumers[key].append(consumer)

    def remove_consumer(self, consumer: MQTTConsumer):
        key = consumer.topic

        if key in self.__consumers:
            self.__consumers[key].remove(consumer)

        topic = '{}/{}'.format(self.__config.topic_base, key)
        self.__logger.info(
            'Unsubcribing from topic \'{:s}\''.format(topic)
        )
        self.__client.unsubscribe(topic)

    def add_producer(self):
        def publish(topic, message):
            # add the timestamp to the message
            message['timestamp'] = int(datetime.utcnow().timestamp() * 1000)

            topic = '{}/{}'.format(self.__config.topic_base, topic)

            return self.__publish(topic, message)
        return publish

    def loop(self):
        self.__client.loop_forever()

    def __connect(self):
        if self.__config.mqtt_address is None:
            error = 'Cannot connect to MQTT, no address specified'
            self.__logger.error(error)
            raise EnvironmentError(error)

        if self.__config.topic_base is None:
            error = 'Cannot connect to MQTT, no topic base specified'
            self.__logger.error(error)
            raise EnvironmentError(error)

        self.__logger.info('Connecting to MQTT at {:s}'
                           .format(self.__config.mqtt_address))

        url = urlparse(self.__config.mqtt_address)
        self.__client = mqtt.Client('powerpi_{}'.format(self.__app_name))
        self.__client.on_connect = self.__on_connect
        self.__client.on_message = self.__on_message
        self.__client.connect(url.hostname, url.port, 60)

    def __on_connect(self, _, __, ___, result_code):
        self.__logger.info('MQTT Connected {:d}'.format(result_code))

        for _, consumers in self.__consumers.items():
            for consumer in consumers:
                topic = '{}/{}'.format(self.__config.topic_base,
                                       consumer.topic)
                self.__logger.info(
                    'Subcribing to topic \'{:s}\''.format(topic)
                )
                self.__client.subscribe(topic)

    def __on_message(self, client, user_data, message):
        # read the JSON
        event = json.loads(message.payload)
        self.__logger.info('Received: {:s}:{:s}'
                           .format(message.topic, json.dumps(event)))

        # split the topic
        _, message_type, entity, action = message.topic.split('/', 3)

        # define the listener this was registered for
        listener_key = '{}/{}/{}'.format(message_type, entity, action)

        # send the message to the correct consumers
        if listener_key in self.__consumers:
            for consumer in self.__consumers[listener_key]:
                consumer.on_message(client, user_data, event, entity, action)

    def __publish(self, topic: str, message: dict):
        message = json.dumps(message)
        self.__logger.info('Publishing {:s}:{:s}'.format(topic, message))
        self.__client.publish(topic, message, qos=2, retain=True)
