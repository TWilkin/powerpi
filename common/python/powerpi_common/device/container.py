from dependency_injector import containers, providers

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt.client import MQTTClient
from .factory import DeviceFactory
from .manager import DeviceManager


class DeviceContainer(containers.DeclarativeContainer):
    config = providers.Dependency()

    logger = providers.Dependency()

    mqtt_client = providers.Dependency()

    device_service_provider = providers.Dependency()

    device_factory = providers.Factory(
        DeviceFactory,
        logger=logger,
        service_provider=device_service_provider
    )

    device_manager = providers.Singleton(
        DeviceManager,
        config=config,
        logger=logger,
        factory=device_factory
    )
