import json
import os


class Config(object):
    __instance = None

    def __init__(self):
        self.__devices = Config.__load(os.getenv('DEVICES_FILE'))
        self.__events = Config.__load(os.getenv('EVENTS_FILE'))

    @property
    def device_fatal(self):
        value = os.getenv('DEVICE_FATAL')
        return value.lower() == 'true' if value is not None else False
    
    @property
    def energenie_type(self):
        value = os.getenv('ENERGENIE_TYPE')

        if value is not None:
            value = value.upper()
        
        return value if value is not None and value == 'ENER314' else 'ENER314-RT'

    @property
    def mqtt_address(self):
        return os.getenv('MQTT_ADDRESS')
    
    @property
    def topic_base(self):
        return os.getenv('TOPIC_BASE')

    @property
    def poll_frequency(self):
        freq = as_int(os.getenv('POLL_FREQUENCY'))
        return freq if freq is not None else 120

    @property
    def message_age_cutoff(self):
        cutoff = as_int(os.getenv('MESSAGE_AGE_CUTOFF'))
        return cutoff if cutoff is not None else 120
    
    @property
    def devices(self):
        return self.__devices
    
    @property
    def events(self):
        return self.__events
    
    @classmethod
    def instance(cls):
        if cls.__instance is None:
            cls.__instance = Config()
        
        return cls.__instance

    @classmethod
    def __load(cls, file):
        with open(file, 'r') as json_file:
            return json.load(json_file)


def as_int(value):
    if value is None:
        return None
    
    try:
        return int(value)
    except ValueError:
        return None
