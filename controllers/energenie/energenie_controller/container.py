from dependency_injector import containers, providers

from powerpi_common.container import Container as CommonContainer
from energenie_controller.__version__ import __app_name__, __version__
from energenie_controller.config import EnergenieConfig
from energenie_controller.controller import Controller


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

    config = providers.Singleton(
        EnergenieConfig
    )

    controller = providers.Singleton(
        Controller,
        config=config,
        logger=common.logger,
        config_retriever=common.config_retriever,
        device_manager=common.device.device_manager,
        event_manager=common.event_manager,
        mqtt_client=common.mqtt_client,
        device_status_checker=common.device.device_status_checker
    )
