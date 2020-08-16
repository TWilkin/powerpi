import copy

from power_starter.devices import DeviceManager
from power_starter.mqtt import MQTTConsumer
from power_starter.util.logger import Logger


class EventManager(object):

    __consumers = []

    @classmethod
    def load(cls, events, client, config):
        # iterate over the configuration and listen to the topics
        for event in events:
            topic = '{}/event/{}'.format(config.topic_base, event['topic'])
            (_, message_type, entity, action) = topic.split('/', 3)
            key = '{}/{}'.format(message_type, action)

            consumer = ConfigEventConsumer(topic, entity, event['action'], event['condition'])
            client.add_consumer(key, consumer)
            cls.__consumers.append(consumer)


class ConfigEventConsumer(MQTTConsumer):

    def __init__(self, topic, entity, action, condition):
        MQTTConsumer.__init__(self, topic)
        self.__entity = entity
        self.__device = action['device']
        self.__state = action['state']
        self.__condition = condition

    # MQTT message callback
    def on_message(self, client, user_data, message, entity, action):
        # execute the action if the condition is met
        if entity == self.__entity:
            if message == self.__condition:
                Logger.info('Condition match for {:s}'.format(str(self)))
                self.__power()
            else:
                Logger.info('Condition mismatch for {:s}'.format(str(self)))
    
    # change the power state of a device
    def __power(self):
        # get the device
        device = DeviceManager.get_device(self.__device)
        if device is None:
            Logger.error('No such device {:s}'.format(self.__device))
            return
        
        # turn the device on/off
        try:
            Logger.info('Turning device {:s} {:s}'.format(self.__device, self.__state))
            if self.__state == 'on':
                device.turn_on()
            else:
                device.turn_off()
        except e:
            Logger.exception(e)
            return
    
    def __str__(self):
        return '{:s}({:s}:{:s})'.format(self.topic, self.__device, self.__state)
