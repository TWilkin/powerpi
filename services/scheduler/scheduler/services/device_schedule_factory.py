from typing import Any, Dict
from dependency_injector import providers
from powerpi_common.logger import Logger, LogMixin


class DeviceScheduleFactory(LogMixin):
    '''
    Builds the appropriate DeviceSchedule instance based on the config.
    '''

    def __init__(
        self,
        logger: Logger,
        device_interval_schedule_factory: providers.Factory,
        device_single_schedule_factory: providers.Factory,
    ):
        self._logger = logger

        self.__device_interval_schedule_factory = device_interval_schedule_factory
        self.__device_single_schedule_factory = device_single_schedule_factory

    def build(self, device: str, device_schedule: Dict[str, Any]):
        kwargs = {
            'device': device,
            **device_schedule
        }

        if 'duration' in device_schedule and 'interval' in device_schedule:
            return self.__device_interval_schedule_factory(**kwargs)

        # the single schedule just uses "schedule"
        return self.__device_single_schedule_factory(**kwargs)
