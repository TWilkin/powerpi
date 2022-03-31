from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dependency_injector import containers, providers

from .factory import DeviceFactory
from .manager import DeviceManager
from .status import DeviceStatusChecker


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    mqtt_client = providers.Dependency()

    scheduler = providers.Factory(
        AsyncIOScheduler
    )

    device_factory = providers.Factory(
        DeviceFactory,
        logger=logger,
        service_provider=service_provider
    )

    device_manager = providers.Singleton(
        DeviceManager,
        config=config,
        logger=logger,
        factory=device_factory
    )

    device_status_checker = providers.Singleton(
        DeviceStatusChecker,
        logger=logger,
        device_manager=device_manager,
        scheduler=scheduler
    )
