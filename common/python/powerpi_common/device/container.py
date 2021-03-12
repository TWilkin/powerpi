from dependency_injector import containers, providers

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt.client import MQTTClient
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
        config=config,
        logger=logger,
        device_manager=device_manager
    )
