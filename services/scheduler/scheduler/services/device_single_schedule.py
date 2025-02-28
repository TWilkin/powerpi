from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger
from dependency_injector import providers
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTMessage
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
        cron_factory: providers.Factory,
        device: str,
        brightness: int | None = None,
        hue: int | None = None,
        saturation: int | None = None,
        temperature: int | None = None,
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
            cron_factory,
            device,
            **kwargs
        )

        self.__additional_state = {}
        if brightness is not None:
            self.__additional_state['brightness'] = brightness
        if hue is not None:
            self.__additional_state['hue'] = hue
        if saturation is not None:
            self.__additional_state['saturation'] = saturation
        if temperature is not None:
            self.__additional_state['temperature'] = temperature

    def _build_trigger(self):
        at = self._next_run()

        trigger = DateTrigger(
            run_date=at
        )

        params = None

        return (trigger, params)

    def _build_message(self, message: MQTTMessage, **_):
        return {
            **message,
            **self.__additional_state
        }

    def _check_next_condition(self, **_):
        return True
