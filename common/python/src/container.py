from dependency_injector import containers, providers

from . config import Config
from . logger import Logger
from .mqtt.client import MQTTClient


class Container(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        Config
    )

    logger = providers.Singleton(
        Logger
    )

    mqtt_client = providers.Singleton(
        MQTTClient,
        config=config,
        logger=logger
    )
