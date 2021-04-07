from dependency_injector import containers, providers

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import DeviceContainer
from powerpi_common.event import EventManager
from powerpi_common.mqtt.client import MQTTClient


class Container(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    app_name = providers.Dependency()

    config = providers.Singleton(
        Config
    )

    logger = providers.Singleton(
        Logger,
        config=config
    )

    mqtt_client = providers.Singleton(
        MQTTClient,
        app_name=app_name,
        config=config,
        logger=logger
    )

    device = providers.Container(
        DeviceContainer,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client
    )

    event_manager = providers.Singleton(
        EventManager,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client,
        device_manager=device.device_manager
    )
