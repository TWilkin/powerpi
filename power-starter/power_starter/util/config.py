import json
import os


class Config(object):
    def __init__(self):
        self._devices = Config._load(os.getenv('DEVICES_FILE'))
        self._events = Config._load(os.getenv('EVENTS_FILE'))

    @property
    def mqtt_address(self):
        return os.getenv('MQTT_ADDRESS')
    
    @property
    def topic_base(self):
        return os.getenv('TOPIC_BASE')
    
    @property
    def devices(self):
        return self._devices
    
    @property
    def events(self):
        return self._events

    @classmethod
    def _load(cls, file):
        with open(file, 'r') as json_file:
            return json.load(json_file)
