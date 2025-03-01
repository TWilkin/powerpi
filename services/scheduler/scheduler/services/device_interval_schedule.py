from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import StrEnum, unique
from typing import Dict, List, Tuple

import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from dependency_injector import providers
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from powerpi_common.variable import VariableManager

from scheduler.config import SchedulerConfig
from .device_schedule import DeviceSchedule


@unique
class DeltaType(StrEnum):
    BRIGHTNESS = 'brightness'
    HUE = 'hue'
    SATURATION = 'saturation'
    TEMPERATURE = 'temperature'


@dataclass
class DeltaRange:
    type: DeltaType
    start: float
    end: float

    @property
    def increasing(self):
        return self.start < self.end


class DeviceIntervalSchedule(DeviceSchedule):
    '''
    Service to schedule and run a device's schedule defined in the schedules.json configuration file
    on an interval.
    '''

    def __init__(
        self,
        config: SchedulerConfig,
        logger: Logger,
        mqtt_client: MQTTClient,
        scheduler: AsyncIOScheduler,
        variable_manager: VariableManager,
        condition_parser_factory: providers.Factory,
        cron_factory: providers.Factory,
        duration: str,
        interval: str,
        force: bool = False,
        brightness: List[str] | None = None,
        hue: List[str] | None = None,
        saturation: List[str] | None = None,
        temperature: List[str] | None = None,
        **kwargs
    ):
        # pylint: disable=too-many-arguments,too-many-locals
        DeviceSchedule.__init__(
            self,
            config,
            logger,
            mqtt_client,
            scheduler,
            variable_manager,
            condition_parser_factory,
            cron_factory,
            **kwargs
        )

        self.__duration = int(duration)
        self.__interval = int(interval)
        self.__force = force

        self.__delta: Dict[DeltaType, DeltaRange] = {}

        additional_state = {
            DeltaType.BRIGHTNESS: brightness,
            DeltaType.HUE: hue,
            DeltaType.SATURATION: saturation,
            DeltaType.TEMPERATURE: temperature
        }

        for delta_type in [DeltaType.BRIGHTNESS, DeltaType.TEMPERATURE]:
            if additional_state[delta_type] is not None:
                self.__delta[delta_type] = DeltaRange(
                    delta_type,
                    int(additional_state[delta_type][0]),
                    int(additional_state[delta_type][1])
                )

        for delta_type in [DeltaType.HUE, DeltaType.SATURATION]:
            if additional_state[delta_type] is not None:
                self.__delta[delta_type] = DeltaRange(
                    delta_type,
                    float(additional_state[delta_type][0]),
                    float(additional_state[delta_type][1])
                )

    def _build_trigger(self):
        (start_date, end_date) = self.__calculate_dates()

        trigger = IntervalTrigger(
            start_date=start_date,
            end_date=end_date,
            seconds=self.__interval
        )

        params = {
            'start_date': start_date,
            'end_date': end_date
        }

        return (trigger, params)

    def _build_message(self, message: MQTTMessage, **kwargs):
        start_date = kwargs['start_date']

        for _, delta_range in self.__delta.items():
            new_value = self.__calculate_new_value(start_date, delta_range)

            self.log_info(
                'Setting %s %s to %0.2f',
                delta_range.type,
                self._device.name,
                new_value
            )

            message[delta_range.type] = new_value

        return message

    def _check_next_condition(self, **kwargs):
        end_date = kwargs['end_date']

        return end_date <= datetime.now(pytz.UTC)

    def __calculate_dates(self):
        start_date = self._next_run()
        end_date = start_date + timedelta(seconds=self.__duration)

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

        device = self._device
        additional_state = device.get_additional_state_for_scene(self._scene)

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
        builder = f'Every {self.__interval}s for {self.__duration}s'

        builder += super().__str__()

        for device_type, delta in self.__delta.items():
            builder += f', {device_type} between {delta.start} and {delta.end}'

        return builder


def round_for_type(delta_type: DeltaType, value: float):
    places = 0

    if delta_type in [DeltaType.BRIGHTNESS, DeltaType.SATURATION]:
        places = 2

    return round(value, places)
