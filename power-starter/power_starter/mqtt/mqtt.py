import json
from urllib.parse import urlparse

import paho.mqtt.client as mqtt

from power_starter.util.logger import Logger

class MQTTClient:

    def __init__(self):
        self.__client = None
        self.__consumers = {}

    def connect(self, address):
        url = urlparse(address)
        self.__client = mqtt.Client()
        self.__client.on_connect = self.__on_connect
        self.__client.on_message = self.__on_message
        self.__client.connect(url.hostname, url.port, 60)
    
    def add_consumer(self, key, consumer):
        if not key in self.__consumers:
            self.__consumers[key] = []
        self.__consumers[key].append(consumer)
    
    def add_producer(self):
        def publish(topic, message):
            return self.__publish(topic, message)
        return publish            

    def loop(self):
        self.__client.loop_forever()
    
    def __on_connect(self, _, __, ___, result_code):
        Logger.info('MQTT Connect {:d}'.format(result_code))
        for _, consumers in self.__consumers.items():
            for consumer in consumers:
                Logger.info('Subcribing to topic \'{:s}\''.format(consumer.topic))
                self.__client.subscribe(consumer.topic)
    
    def __on_message(self, client, user_data, message):
        # read the JSON
        event = json.loads(message.payload)
        Logger.info('Received: {:s}:{:s}'.format(message.topic, json.dumps(event)))

        # split the topic
        _, message_type, entity, action = message.topic.split('/', 3)
        
        # define the listener this was registered for
        listener_key = '{}/{}'.format(message_type, action)

        # send the message to the correct consumers
        if listener_key in self.__consumers:
            for consumer in self.__consumers[listener_key]:
                consumer.on_message(client, user_data, event, entity, action)

    def __publish(self, topic, message):
        message = json.dumps(message)
        Logger.info('Publishing {:s}:{:s}'.format(topic, message))
        self.__client.publish(topic, message, qos=2, retain=True)


class MQTTConsumer:

    def __init__(self, topic):
        self.topic = topic

    def on_message(self, client, user_data, message, entity, action):
        raise NotImplementedError
