from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer

from event.__version__ import __app_name__, __version__
from event.application import Application
from event.config import EventConfig


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        EventConfig
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__,
        version=__version__,
        config=config
    )

    application = providers.Singleton(
        Application,
        logger=common.logger,
        config_retriever=common.config_retriever,
        mqtt_client=common.mqtt_client,
        scheduler=common.scheduler,
        health=common.health
    )
