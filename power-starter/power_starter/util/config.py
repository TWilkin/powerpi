import json
import os


class Config(object):
    def __init__(self):
        self.__devices = Config.__load(os.getenv('DEVICES_FILE'))
        self.__events = Config.__load(os.getenv('EVENTS_FILE'))

    @property
    def mqtt_address(self):
        return os.getenv('MQTT_ADDRESS')
    
    @property
    def topic_base(self):
        return os.getenv('TOPIC_BASE')

    @property
    def poll_frequency(self):
        freq = os.getenv('POLL_FREQUENCY')
        
        if freq is not None:
            value = int(freq)
            return value
        
        return 120
    
    @property
    def devices(self):
        return self.__devices
    
    @property
    def events(self):
        return self.__events

    @classmethod
    def __load(cls, file):
        with open(file, 'r') as json_file:
            return json.load(json_file)
