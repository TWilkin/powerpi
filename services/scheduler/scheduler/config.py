from powerpi_common.config import Config as CommonConfig
from powerpi_common.config import ConfigFileType


class SchedulerConfig(CommonConfig):
    @property
    def used_config(self):
        return [ConfigFileType.DEVICES, ConfigFileType.SCHEDULES]
