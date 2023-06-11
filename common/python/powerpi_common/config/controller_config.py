from .config import Config, ConfigFileType


class ControllerConfig(Config):
    '''
    Configuration for a controller (one that controls devices) service.
    '''

    @property
    def used_config(self):
        return [ConfigFileType.DEVICES, ConfigFileType.EVENTS]
