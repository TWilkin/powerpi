from datetime import datetime, time
from typing import Any, Dict

import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger
from dependency_injector import providers
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import VariableManager

from scheduler.config import SchedulerConfig
from .device_schedule import DeviceSchedule


class DeviceSingleSchedule(DeviceSchedule):
    '''
    Service to schedule and run a device's schedule defined in the schedules.json configuration file
    one time based at a specific time.
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
        at: str,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        DeviceSchedule.__init__(
            self,
            config,
            logger,
            mqtt_client,
            scheduler,
            variable_manager,
            condition_parser_factory,
            device,
            **kwargs
        )

        self.__at = at

    def build_trigger(self, start: datetime | None = None):
        at = self.__calculate_date(start)

        trigger = DateTrigger(
            run_date=at
        )

        params = None

        return (trigger, params)

    def _build_message(self, message, **_):
        return message

    def _check_next_condition(self, **_):
        return True

    def __calculate_date(self, start: datetime | None = None):
        at = [int(part) for part in self.__at.split(':', 3)]

        timezone = self._timezone

        start_date = timezone.localize(datetime.combine(
            start.date(), time(at[0], at[1], at[2], 0)
        ))

        # find the next appropriate day-of-week
        start_date = self._find_valid_day(start_date)

        start_date = start_date.astimezone(pytz.UTC)

        return start_date

    def __str__(self):
        builder = f'Every {self.__at}'

        builder += super().__str__()

        return builder
