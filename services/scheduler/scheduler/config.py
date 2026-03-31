from powerpi_common.config import Config as CommonConfig


class SchedulerConfig(CommonConfig):
    @property
    def timezone(self):
        return self.__timezone

    @timezone.setter
    def timezone(self, timezone: str):
        self.__timezone = timezone
