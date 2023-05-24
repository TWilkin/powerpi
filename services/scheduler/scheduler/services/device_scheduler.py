from typing import List

from dependency_injector import providers
from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.logger import Logger, LogMixin
from scheduler.config import SchedulerConfig
from scheduler.services.device_schedule import DeviceSchedule


class DeviceScheduler(LogMixin):
    '''
    Service to take the schedules and register each at the appropriate time.
    '''

    def __init__(
        self,
        config: SchedulerConfig,
        logger: Logger,
        device_schedule_factory: providers.Factory
    ):
        self.__config = config
        self._logger = logger
        self.__device_schedule_factory = device_schedule_factory

    def start(self):
        device_config = self.__config.devices
        schedule_config = self.__config.schedules

        devices: List[str] = [
            device['name'] for device in device_config['devices']
        ]
        self.log_info('Found %d device(s)', len(devices))

        self.__config.timezone = schedule_config['timezone']
        self.log_info('Using timezone %s', self.__config.timezone)

        schedules = schedule_config['schedules']
        for schedule in schedules:
            schedule_devices = [schedule['device']] if 'device' in schedule \
                else schedule['devices']

            for schedule_device in schedule_devices:
                if schedule_device in devices:
                    device_schedule: DeviceSchedule = self.__device_schedule_factory(
                        device=schedule_device,
                        device_schedule=schedule
                    )

                    device_schedule.start()
                else:
                    raise DeviceNotFoundException(
                        DeviceConfigType.DEVICE, schedule_device
                    )
