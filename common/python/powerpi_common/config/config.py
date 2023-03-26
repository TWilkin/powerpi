import json
import os
from enum import Enum
from typing import Any, Dict


class ConfigFileType(str, Enum):
    DEVICES = 'devices'
    EVENTS = 'events'


class Config:
    __configs: Dict[ConfigFileType, Dict[str, Any]]

    def __init__(self):
        self.__configs = {}

    @property
    def log_level(self):
        level = os.getenv('LOG_LEVEL')
        return level.upper() if level is not None else 'INFO'

    @property
    def mqtt_address(self):
        address = os.getenv('MQTT_ADDRESS')
        return address if address is not None else 'mqtt://mosquitto:1883'

    @property
    def mqtt_connect_timeout(self):
        timeout = as_int(os.getenv('MQTT_CONNECT_TIMEOUT'))
        return timeout if timeout is not None else 60

    @property
    def topic_base(self):
        base = os.getenv('TOPIC_BASE')
        return base if base is not None else 'powerpi'

    @property
    def health_check_file(self):
        health_file = os.getenv("HEALTH_CHECK_FILE")
        return health_file if health_file is not None else '/var/run/powerpi_health'

    @property
    def poll_frequency(self):
        freq = as_int(os.getenv('POLL_FREQUENCY'))
        return freq if freq is not None else 120

    @property
    def message_age_cutoff(self):
        cutoff = as_int(os.getenv('MESSAGE_AGE_CUTOFF'))
        return cutoff if cutoff is not None else 10

    @property
    def config_wait_time(self):
        time = as_int(os.getenv('CONFIG_WAIT_TIME'))
        return time if time is not None else 2 * 60

    @property
    def config_is_needed(self):
        return not self.use_config_file

    @property
    def use_config_file(self):
        use = os.getenv("USE_CONFIG_FILE")
        return use.upper() == "TRUE" if use is not None else False

    @property
    def devices(self):
        return self.__file_or_config('DEVICES_FILE', ConfigFileType.DEVICES)

    @property
    def events(self):
        return self.__file_or_config('EVENTS_FILE', ConfigFileType.EVENTS)

    @property
    def is_populated(self):
        types = [file_type.value for file_type in ConfigFileType]
        return all((self.__configs.get(fileType) is not None for fileType in types))

    @property
    def used_config(self):
        return [fileType.value for fileType in ConfigFileType]

    def get_config(self, file_type: ConfigFileType):
        return self.__configs.get(file_type)

    def set_config(self, file_type: ConfigFileType, data: dict):
        self.__configs[file_type] = data

    @classmethod
    def __load(cls, file: str):
        with open(file, 'r', encoding='utf8') as json_file:
            return json.load(json_file)

    def __file_or_config(self, key: str, file_type: ConfigFileType):
        if self.use_config_file:
            path = os.getenv(key)

            if path is not None:
                return Config.__load(path)

        config = self.get_config(file_type.value)
        if config is not None:
            return config

        return None


def as_int(value):
    if value is None:
        return None

    try:
        return int(value)
    except ValueError:
        return None
