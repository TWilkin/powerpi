from powerpi_common.config import Config as CommonConfig
from powerpi_common.config import ConfigFileType


class EventConfig(CommonConfig):
    @property
    def used_config(self):
        return [ConfigFileType.DEVICES, ConfigFileType.EVENTS]
