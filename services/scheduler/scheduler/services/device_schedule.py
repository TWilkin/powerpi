from collections import namedtuple
from datetime import datetime, timedelta
from enum import Enum, IntEnum
from typing import Any, Dict, List, Union

import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from powerpi_common.device import DeviceStatus
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.mqtt import MQTTClient
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


Delta = namedtuple('Delta', 'start end delta')


class DeviceSchedule(LogMixin):
    # pylint: disable=too-many-instance-attributes
    '''
    Service to schedule and run a device's schedule from the schedules.json configuration file.
    '''

    def __init__(
        self,
        config: SchedulerConfig,
        logger: Logger,
        mqtt_client: MQTTClient,
        scheduler: AsyncIOScheduler,
        device: str,
        device_schedule: Dict[str, Any]
    ):
        # pylint: disable=too-many-arguments

        self.__config = config
        self._logger = logger
        self.__scheduler = scheduler

        self.__producer = mqtt_client.add_producer()

        self.__device = device
        self.__parse(device_schedule)

    def start(self):
        self.log_info(self)

        self.__start_schedule()

    async def execute(self, start_date: datetime, end_date: datetime):
        if end_date <= datetime.now(pytz.UTC):
            # this will be the last run so schedule the next one
            self.__start_schedule(end_date)

        message = {}

        for delta_type, delta in self.__delta.items():
            new_value = self.__calculate_new_value(start_date, delta)

            self.log_info(
                'Setting %s %s to %d',
                delta_type,
                self.__device,
                new_value
            )

            message[delta_type] = new_value

        if self.__power is not None:
            new_state = DeviceStatus.ON if self.__power else DeviceStatus.OFF

            self.log_info('Setting %s power to %s', self.__device, new_state)

            message['state'] = new_state

        if len(message) > 0:
            topic = f'device/{self.__device}/change'
            self.__producer(topic, message)

    def __parse(self, device_schedule: Dict[str, Any]):
        self.__between: List[str] = device_schedule['between']
        self.__interval = int(device_schedule['interval'])

        self.__days = device_schedule['days'] if 'days' in device_schedule \
            else None

        self.__delta: Dict[DeltaType, Delta] = {}

        for delta_type in [DeltaType.BRIGHTNESS, DeltaType.TEMPERATURE]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = self.__calculate_delta(
                    int(device_schedule[delta_type][0]),
                    int(device_schedule[delta_type][1])
                )

        for delta_type in [DeltaType.HUE, DeltaType.SATURATION]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = self.__calculate_delta(
                    float(device_schedule[delta_type][0]),
                    float(device_schedule[delta_type][1])
                )

        self.__power = bool(device_schedule['power']) if 'power' in device_schedule \
            else None

    def __start_schedule(self, start: Union[datetime, None] = None):
        '''Schedule the next run.'''
        (start_date, end_date) = self.__calculate_dates(start)

        trigger = IntervalTrigger(
            start_date=start_date,
            end_date=end_date,
            seconds=self.__interval
        )

        job_name = f'DeviceSchedule.execute({self.__device})'

        self.log_info(
            'Scheduling %s between %s and %s every %ds',
            job_name,
            start_date,
            end_date,
            self.__interval
        )

        self.__scheduler.add_job(
            self.execute, trigger, (start_date, end_date), name=job_name
        )

    def __calculate_dates(self, start: Union[datetime, None] = None):
        start_time = [int(part) for part in self.__between[0].split(':', 3)]
        end_time = [int(part) for part in self.__between[1].split(':', 3)]

        timezone = pytz.timezone(self.__config.timezone)

        def make_dates(start: datetime):
            start_date = start.replace(
                hour=start_time[0],
                minute=start_time[1],
                second=start_time[2],
                microsecond=0
            )

            end_date = start_date.replace(
                hour=end_time[0],
                minute=end_time[1],
                second=end_time[2],
                microsecond=0
            )

            # handle end_time on the next day
            if end_date <= start_date:
                end_date = end_date + timedelta(days=1)

            # check it's not in the past
            if end_date <= datetime.now(timezone):
                start_date += timedelta(days=1)

            return start_date, end_date

        # get a first guess start_date
        (start_date, _) = make_dates(
            start.astimezone(timezone) if start is not None
            else datetime.now(timezone)
        )

        # find the next appropriate day-of-week
        if self.__days is not None:
            days = [
                int(DayOfWeek[value.upper()]) for value in self.__days
            ]

            while start_date.weekday() not in days:
                start_date += timedelta(days=1)

        (start_date, end_date) = make_dates(start_date)

        start_date = start_date.astimezone(pytz.UTC)
        end_date = end_date.astimezone(pytz.UTC)

        return (start_date, end_date)

    def __calculate_delta(self, start: float, end: float):
        (start_date, end_date) = self.__calculate_dates()

        # how many seconds between the dates
        seconds = end_date.timestamp() - start_date.timestamp()

        # how many intervals will there be
        intervals = seconds / self.__interval

        # what is the delta
        delta = (end - start) / intervals

        return Delta(start, end, delta)

    def __calculate_new_value(self, start_date: datetime, delta: Delta):
        # calculate how much time has elapsed
        diff = datetime.now(pytz.UTC).timestamp() - start_date.timestamp()

        # how many intervals is that
        intervals = diff / self.__interval

        new_value = delta.start + delta.delta * intervals

        new_value = round(new_value)
        if delta.delta > 0:
            new_value = min(max(new_value, delta.start), delta.end)
        else:
            new_value = max(min(new_value, delta.start), delta.end)

        return new_value

    def __str__(self):
        builder = f'Every {self.__interval}s between {self.__between[0]} and {self.__between[1]}'

        if self.__days:
            days = ', '.join(self.__days)
            builder += f' on {days}'
        else:
            builder += ' every day'

        builder += f' adjust {self.__device}'

        for device_type, delta in self.__delta.items():
            builder += f' {device_type} between {delta.start} and {delta.end}'

        if self.__power:
            builder += ' and turn it on'

        return builder
