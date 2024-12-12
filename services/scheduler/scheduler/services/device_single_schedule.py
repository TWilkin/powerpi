from datetime import datetime
from typing import Any, Dict

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
        device_schedule: Dict[str, Any]
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
            device_schedule
        )

        self.__at: str = device_schedule['at']

    def build_trigger(self, start: datetime | None = None):
        trigger = DateTrigger(
            run_date=start
        )

        params = None

        return (trigger, params)

    def _build_message(self, message, **_):
        return message

    def _check_next_condition(self, **_):
        return True

    def __str__(self):
        builder = f'Every {self.__at}'

        builder += super().__str__()

        return builder
