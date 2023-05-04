from powerpi_common.config import Config as CommonConfig
from powerpi_common.config import ConfigFileType


class SchedulerConfig(CommonConfig):
    @property
    def used_config(self):
        return [ConfigFileType.DEVICES, ConfigFileType.SCHEDULES]

    @property
    def timezone(self):
        return self.__timezone

    @timezone.setter
    def timezone(self, timezone: str):
        self.__timezone = timezone
