from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from enum import IntEnum, unique
from typing import Any, List, Tuple

import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.base import BaseTrigger
from dependency_injector import providers
from powerpi_common.condition import (ConditionParser, Expression,
                                      ParseException)
from powerpi_common.device import DeviceStatus
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from powerpi_common.variable import VariableManager

from scheduler.config import SchedulerConfig


@unique
class DayOfWeek(IntEnum):
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6


class DeviceSchedule(ABC, LogMixin):
    # pylint: disable=too-many-instance-attributes
    '''
    Base class for device schedules.
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
        days: List[str] | None = None,
        condition: Expression | None = None,
        scene: str | None = None,
        power: bool | None = None
    ):
        # pylint: disable=too-many-arguments

        self.__config = config
        self._logger = logger
        self.__scheduler = scheduler
        self.__variable_manager = variable_manager
        self.__condition_parser_factory = condition_parser_factory

        self.__producer = mqtt_client.add_producer()

        self.__device = device
        self.__days = days
        self.__condition = condition
        self.__power = power

        self._scene = scene

    @property
    def _device(self):
        return self.__variable_manager.get_device(
            self.__device
        )

    @property
    def _timezone(self):
        return pytz.timezone(self.__config.timezone)

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

        self.__schedule_next_run()

    async def execute(self, **kwargs):
        # if we're ready, schedule the next run
        if self._check_next_condition(**kwargs):
            self.__schedule_next_run()

        if not self.__check_condition():
            self.log_info(
                'Skipping for %s as condition is false', self.__device
            )
            return

        message = self._build_message({}, **kwargs)

        if self._scene:
            message['scene'] = self._scene

        if self.__power is not None:
            new_state = DeviceStatus.ON if self.__power else DeviceStatus.OFF

            self.log_info('Setting %s power to %s', self.__device, new_state)

            message['state'] = new_state

        if len(message) > 0:
            topic = f'device/{self.__device}/change'
            self.__producer(topic, message)

    @property
    def schedule_type(self):
        '''
        Return the type of device schedule this is
        '''
        return self.__class__.__name__

    @abstractmethod
    def _build_trigger(self, start: datetime | None = None) -> Tuple[BaseTrigger, List[Any]]:
        '''
        Extend to build the trigger for the next run of the schedule.
        '''
        raise NotImplementedError

    @abstractmethod
    def _build_message(self, message: MQTTMessage, **kwargs) -> MQTTMessage:
        '''
        Extend to build the message to send to the message queue.
        '''
        raise NotImplementedError

    @abstractmethod
    def _check_next_condition(self, **kwargs):
        '''
        Extend to check whether we should schedule the next occurrence.
        '''
        raise NotImplementedError

    def _find_valid_day(self, date: datetime):
        '''
        Find the next possible day the schedule is configured to run on.
        '''
        if self.__days is not None:
            days = [
                int(DayOfWeek[value.upper()]) for value in self.__days
            ]

            while date.weekday() not in days:
                date += timedelta(days=1)

        return date

    def __check_condition(self):
        '''
        If the schedule has a condition, execute it. Otherwise always returns true.
        '''
        if self.__condition is not None:
            parser: ConditionParser = self.__condition_parser_factory()
            return parser.conditional_expression(self.__condition)

        return True

    def __schedule_next_run(self):
        '''
        Add the scheduled job for the next execution.
        '''
        [trigger, params] = self._build_trigger()

        job_name = f'{self.schedule_type}.execute({self.__device})'

        self.__scheduler.add_job(
            self.execute, trigger, kwargs=params, name=job_name
        )

    def __str__(self):
        if self.__days:
            days = ', '.join(self.__days)
            builder = f' on {days}'
        else:
            builder = ' every day'

        if self.__condition:
            builder += ', if the condition is true,'

        builder += f' adjust {self.__device}'

        if self.__power is True:
            builder += ' and turn it on'
        elif self.__power is False:
            builder += ' and turn it off'

        if self._scene:
            builder += f' for scene {self._scene}'

        return builder
