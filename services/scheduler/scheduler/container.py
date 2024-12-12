from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer

from scheduler.__version__ import __app_name__, __version__
from scheduler.application import Application
from scheduler.config import SchedulerConfig
from scheduler.services import (
    DeviceIntervalSchedule,
    DeviceScheduler,
    DeviceScheduleFactory,
    DeviceSingleSchedule
)


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        SchedulerConfig
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__,
        version=__version__,
        config=config
    )

    device_interval_schedule = providers.Factory(
        DeviceIntervalSchedule,
        config=config,
        logger=common.logger,
        mqtt_client=common.mqtt_client,
        scheduler=common.scheduler,
        variable_manager=common.variable.variable_manager,
        condition_parser_factory=common.condition.condition_parser.provider
    )

    device_single_schedule = providers.Factory(
        DeviceSingleSchedule,
        config=config,
        logger=common.logger,
        mqtt_client=common.mqtt_client,
        scheduler=common.scheduler,
        variable_manager=common.variable.variable_manager,
        condition_parser_factory=common.condition.condition_parser.provider
    )

    device_schedule_factory = providers.Factory(
        DeviceScheduleFactory,
        logger=common.logger,
        device_interval_schedule_factory=device_interval_schedule.provider,
        device_single_schedule_factory=device_single_schedule.provider,
    )

    device_scheduler = providers.Factory(
        DeviceScheduler,
        config=config,
        logger=common.logger,
        device_schedule_factory=device_schedule_factory
    )

    application = providers.Singleton(
        Application,
        logger=common.logger,
        config_retriever=common.config_retriever,
        mqtt_client=common.mqtt_client,
        scheduler=common.scheduler,
        health=common.health,
        device_scheduler=device_scheduler
    )
