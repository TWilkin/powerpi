from io import StringIO
import json
import os


class Config(object):
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
        return Config.__load(
            os.getenv('DEVICES_FILE'), os.getenv('DEVICES')
        )

    @property
    def events(self):
        return Config.__load(
            os.getenv('EVENTS_FILE'), os.getenv('EVENTS')
        )

    @classmethod
    def __load(cls, file, content):
        try:
            with open(file, 'r') as json_file:
                return json.load(json_file)
        except:
            return json.load(StringIO(content))


def as_int(value):
    if value is None:
        return None

    try:
        return int(value)
    except ValueError:
        return None
