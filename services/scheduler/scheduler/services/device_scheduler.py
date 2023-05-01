from typing import List

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.logger import Logger, LogMixin
from scheduler.config import SchedulerConfig


class DeviceScheduler(LogMixin):
    '''
    Service to take the schedules and register each at the appropriate time.
    '''

    def __init__(
        self,
        config: SchedulerConfig,
        logger: Logger,
        scheduler: AsyncIOScheduler,
        service_provider
    ):
        self.__config = config
        self._logger = logger
        self.__scheduler = scheduler
        self.__service_provider = service_provider

    def start(self):
        device_config = self.__config.devices
        schedule_config = self.__config.schedules

        devices: List[str] = [
            device['name'] for device in device_config['devices']
        ]
        self.log_info('Found %d device(s)', len(devices))

        timezone = schedule_config['timezone']
        self.log_info('Using timezone %s', timezone)

        schedules = schedule_config['schedules']
        for schedule in schedules:
            if schedule['device'] in devices:
                self.__schedule(timezone, schedule)
            else:
                raise DeviceNotFoundException(
                    DeviceConfigType.DEVICE, schedule['device']
                )

    def __schedule(self, timezone: str, schedule):
        self.log_info('Scheduling for %s', schedule['device'])
