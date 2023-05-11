from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer
from scheduler.__version__ import __app_name__, __version__
from scheduler.application import Application
from scheduler.config import SchedulerConfig
from scheduler.services import DeviceSchedule, DeviceScheduler


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
        version=__version__
    )

    device_schedule = providers.Factory(
        DeviceSchedule,
        config=config,
        logger=common.logger,
        mqtt_client=common.mqtt_client,
        scheduler=common.scheduler,
        variable_manager=common.variable.variable_manager,
        condition_parser_factory=common.condition.condition_parser.provider
    )

    device_scheduler = providers.Factory(
        DeviceScheduler,
        config=config,
        logger=common.logger,
        service_provider=service_provider
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
