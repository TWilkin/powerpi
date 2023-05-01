from datetime import datetime, timedelta
from enum import Enum, IntEnum
from typing import Any, Dict, List, Union

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from powerpi_common.logger import Logger, LogMixin
from scheduler.config import SchedulerConfig


class DeltaType(str, Enum):
    BRIGHTNESS = 'brightness'
    HUE = 'hue'
    SATURATION = 'saturation'
    TEMPERATURE = 'temperature'


class DayOfWeek(IntEnum):
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6


class DeviceSchedule(LogMixin):
    # pylint: disable=too-many-instance-attributes
    '''
    Service to schedule and run a device's schedule from the schedules.json configuration file.
    '''

    def __init__(
        self,
        config: SchedulerConfig,
        logger: Logger,
        scheduler: AsyncIOScheduler,
        device_schedule: Dict[str, Any]
    ):
        self.__config = config
        self._logger = logger
        self.__scheduler = scheduler

        self.__parse(device_schedule)

    def start(self):
        self.log_info(self)

        self.__start_schedule()

    def execute(self):
        self.log_info('Executing schedule for %s', self.__device)

    def __parse(self, device_schedule: Dict[str, Any]):
        self.__device: str = device_schedule['device']
        self.__between: List[str] = device_schedule['between']
        self.__interval = int(device_schedule['interval'])

        self.__days = device_schedule['days'] if 'days' in device_schedule \
            else None

        self.__delta: Dict[DeltaType, List[Union[int, float]]] = {}

        for delta_type in [DeltaType.BRIGHTNESS, DeltaType.TEMPERATURE]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = [
                    int(value) for value in device_schedule[delta_type]
                ]

        for delta_type in [DeltaType.HUE, DeltaType.SATURATION]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = [
                    float(value) for value in device_schedule[delta_type]
                ]

        self.__power = bool(device_schedule['power']) if 'power' in device_schedule \
            else False

    def __start_schedule(self):
        '''Schedule the next run.'''
        start_time = [int(part) for part in self.__between[0].split(':', 3)]
        end_time = [int(part) for part in self.__between[1].split(':', 3)]

        # get a first guess start_date
        start_date = datetime.now() \
            .replace(hour=start_time[0], minute=start_time[1], second=start_time[2], microsecond=0)

        # check it's not in the past
        if start_date <= datetime.now():
            start_date += timedelta(days=1)

        # find the next appropriate day-of-week
        if self.__days is not None:
            days = [
                int(DayOfWeek[value.upper()]) for value in self.__days
            ]

            while start_date.weekday() not in days:
                start_date += timedelta(days=1)

        start_date = start_date \
            .replace(hour=start_time[0], minute=start_time[1], second=start_time[2], microsecond=0)

        end_date = start_date \
            .replace(hour=end_time[0], minute=end_time[1], second=end_time[2], microsecond=0)

        # handle end_time on the next day
        if end_date <= start_date:
            end_date = end_date + timedelta(days=1)

        trigger = IntervalTrigger(
            start_date=start_date,
            end_date=end_date,
            seconds=self.__interval,
            timezone=self.__config.timezone
        )

        job_name = f'DeviceSchedule.execute({self.__device})'

        self.log_info(
            'Scheduling %s between %s and %s every %ds',
            job_name,
            start_date,
            end_date,
            self.__interval
        )

        self.__scheduler.add_job(self.execute, trigger, name=job_name)

    def __str__(self):
        builder = f'Every {self.__interval}s between {self.__between[0]} and {self.__between[1]}'

        if self.__days:
            days = ', '.join(self.__days)
            builder += f' on {days}'
        else:
            builder += ' every day'

        builder += f' adjust {self.__device}'

        for device_type, values in self.__delta.items():
            builder += f' {device_type} between {values[0]} and {values[1]}'

        if self.__power:
            builder += ' and turn it on'

        return builder
