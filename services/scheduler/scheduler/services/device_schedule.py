from dataclasses import dataclass
from datetime import datetime, time, timedelta
from enum import IntEnum, StrEnum, unique
from typing import Any, Dict, List, Tuple

import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from dependency_injector import providers
from powerpi_common.condition import (ConditionParser, Expression,
                                      ParseException)
from powerpi_common.device import DeviceStatus
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import VariableManager

from scheduler.config import SchedulerConfig


@unique
class DeltaType(StrEnum):
    BRIGHTNESS = 'brightness'
    HUE = 'hue'
    SATURATION = 'saturation'
    TEMPERATURE = 'temperature'


@unique
class DayOfWeek(IntEnum):
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6


@dataclass
class DeltaRange:
    type: DeltaType
    start: float
    end: float

    @property
    def increasing(self):
        return self.start < self.end


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
        variable_manager: VariableManager,
        condition_parser_factory: providers.Factory,
        device: str,
        device_schedule: Dict[str, Any]
    ):
        # pylint: disable=too-many-arguments

        self.__config = config
        self._logger = logger
        self.__scheduler = scheduler
        self.__variable_manager = variable_manager
        self.__condition_parser_factory = condition_parser_factory

        self.__producer = mqtt_client.add_producer()

        self.__device = device
        self.__parse(device_schedule)

    def start(self):
        self.log_info(self)

        # retrieve this variable to register the listener
        self.__variable_manager.get_device(self.__device)

        # evaluate the condition if there is one
        try:
            self.__check_condition()
        except ParseException as ex:
            self.log_error(
                'Failed to schedule job for %s due to bad condition',
                self.__device
            )
            self.log_exception(ex)
            return

        self.__start_schedule()

    async def execute(self, start_date: datetime, end_date: datetime):
        if end_date <= datetime.now(pytz.UTC):
            # this will be the last run so schedule the next one
            self.__start_schedule(end_date)

        if not self.__check_condition():
            self.log_info(
                'Skipping for %s as condition is false', self.__device
            )
            return

        message = {}

        if self.__scene:
            message['scene'] = self.__scene

        for _, delta_range in self.__delta.items():
            new_value = self.__calculate_new_value(start_date, delta_range)

            self.log_info(
                'Setting %s %s to %0.2f',
                delta_range.type,
                self.__device,
                new_value
            )

            message[delta_range.type] = new_value

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
        self.__force = bool(
            device_schedule['force']) if 'force' in device_schedule else False

        self.__days = device_schedule['days'] if 'days' in device_schedule \
            else None

        self.__delta: Dict[DeltaType, DeltaRange] = {}

        for delta_type in [DeltaType.BRIGHTNESS, DeltaType.TEMPERATURE]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = DeltaRange(
                    delta_type,
                    int(device_schedule[delta_type][0]),
                    int(device_schedule[delta_type][1])
                )

        for delta_type in [DeltaType.HUE, DeltaType.SATURATION]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = DeltaRange(
                    delta_type,
                    float(device_schedule[delta_type][0]),
                    float(device_schedule[delta_type][1])
                )

        self.__power = bool(device_schedule['power']) if 'power' in device_schedule \
            else None

        self.__condition: Expression | None = device_schedule['condition'] \
            if 'condition' in device_schedule \
            else None

        self.__scene = device_schedule['scene'] if 'scene' in device_schedule else None

    def __check_condition(self):
        if self.__condition is not None:
            parser: ConditionParser = self.__condition_parser_factory()
            return parser.conditional_expression(self.__condition)

        return True

    def __start_schedule(self, start: datetime | None = None):
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

    def __calculate_dates(self, start: datetime | None = None):
        start_time = [int(part) for part in self.__between[0].split(':', 3)]
        end_time = [int(part) for part in self.__between[1].split(':', 3)]

        timezone = pytz.timezone(self.__config.timezone)

        def make_dates(start: datetime):
            start_date = timezone.localize(datetime.combine(
                start.date(),
                time(start_time[0], start_time[1], start_time[2], 0)
            ))

            end_date = timezone.localize(datetime.combine(
                start.date(),
                time(end_time[0], end_time[1], end_time[2], 0)
            ))

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

    def __calculate_delta(
        self,
        start_date: datetime,
        delta_range: DeltaRange
    ) -> Tuple[float, float]:
        (schedule_start_date, end_date) = self.__calculate_dates()

        # how many seconds between the dates
        seconds = end_date.timestamp() - schedule_start_date.timestamp()

        # how many intervals will there be
        intervals = seconds / self.__interval + 1

        # work out how many more intervals need to be acted on
        elapsed_seconds = datetime.now(pytz.UTC).timestamp() \
            - start_date.timestamp()
        remaining_intervals = max(
            min(intervals - (elapsed_seconds / self.__interval), intervals), 1)

        device = self.__variable_manager.get_device(
            self.__device
        )
        additional_state = device.get_additional_state_for_scene(self.__scene)

        # do we want to overwrite start with the current value from the device
        if delta_range.type in additional_state:
            start = additional_state[delta_range.type]
        else:
            start = delta_range.start

        # what is the delta
        if self.__force:
            # when we're forcing use the range ignoring what value it already has
            delta = (delta_range.end - delta_range.start) / intervals
            delta *= (intervals - remaining_intervals + 1)

            # but we need to take the disparity into account
            delta += delta_range.start - start
        else:
            delta = (delta_range.end - start) / remaining_intervals

        return (start, delta)

    def __calculate_new_value(self, start_date: datetime, delta_range: DeltaRange):
        (start, delta) = self.__calculate_delta(start_date, delta_range)

        new_value = start + delta

        # ensure the new value is in the correct direction
        if not self.__force and \
                ((new_value > start and not delta_range.increasing)
                 or (new_value < start and delta_range.increasing)
                 or (new_value > delta_range.end and delta_range.increasing)
                 or (new_value < delta_range.end and not delta_range.increasing)):
            new_value = start

            new_value = round_for_type(delta_range.type, new_value)

            return new_value

        new_value = round_for_type(delta_range.type, new_value)
        if delta_range.increasing:
            new_value = min(max(new_value, delta_range.start), delta_range.end)
        else:
            new_value = max(min(new_value, delta_range.start), delta_range.end)

        return new_value

    def __str__(self):
        builder = f'Every {self.__interval}s between {self.__between[0]} and {self.__between[1]}'

        if self.__days:
            days = ', '.join(self.__days)
            builder += f' on {days}'
        else:
            builder += ' every day'

        if self.__condition:
            builder += ', if the condition is true,'

        builder += f' adjust {self.__device}'

        if self.__scene:
            builder += f' for scene {self.__scene}'

        for device_type, delta in self.__delta.items():
            builder += f', {device_type} between {delta.start} and {delta.end}'

        if self.__force:
            builder += ' forcing'

        if self.__power:
            builder += ' and turn it on'

        return builder


def round_for_type(delta_type: DeltaType, value: float):
    places = 0

    if delta_type in [DeltaType.BRIGHTNESS, DeltaType.SATURATION]:
        places = 2

    return round(value, places)
