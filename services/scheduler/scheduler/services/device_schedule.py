from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Tuple

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

        message = {}
        self._build_message(message, **kwargs)

        if self._scene:
            message['scene'] = self._scene

        if self._power is not None:
            new_state = DeviceStatus.ON if self._power else DeviceStatus.OFF

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

    def __parse(self, device_schedule: Dict[str, Any]):
        '''
        Parse the common parts of the schedule, and then call on the implementation to do the rest.
        '''
        self._force = bool(
            device_schedule['force']) if 'force' in device_schedule else False

        self._days = device_schedule['days'] if 'days' in device_schedule \
            else None

        self._power = bool(device_schedule['power']) if 'power' in device_schedule \
            else None

        self._condition: Expression | None = device_schedule['condition'] \
            if 'condition' in device_schedule \
            else None

        self._scene = device_schedule['scene'] if 'scene' in device_schedule else None

    def __check_condition(self):
        '''
        If the schedule has a condition, execute it. Otherwise always returns true.
        '''
        if self._condition is not None:
            parser: ConditionParser = self.__condition_parser_factory()
            return parser.conditional_expression(self._condition)

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
        if self._days:
            days = ', '.join(self._days)
            builder = f' on {days}'
        else:
            builder = ' every day'

        if self._condition:
            builder += ', if the condition is true,'

        if self._force:
            builder += ' force'

        builder += f' adjust {self.__device}'

        if self._power:
            builder += ' and turn it on'

        if self._scene:
            builder += f' for scene {self._scene}'

        return builder
