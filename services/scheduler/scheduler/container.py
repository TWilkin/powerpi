from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer
from scheduler.__version__ import __app_name__, __version__
from scheduler.application import Application


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__,
        version=__version__
    )

    application = providers.Singleton(
        Application,
        logger=common.logger,
        config_retriever=common.config_retriever,
        mqtt_client=common.mqtt_client,
        scheduler=common.scheduler,
        health=common.health
    )
