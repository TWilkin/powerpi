from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer

from network_controller.__version__ import __app_name__, __version__
from network_controller.config import NetworkConfig
from network_controller.controller import Controller
from network_controller.services import ServicesContainer


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        NetworkConfig
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__,
        version=__version__,
        config=config
    )

    services = providers.Container(
        ServicesContainer,
        common=common,
        device=common.device,
        config=config
    )

    controller = providers.Singleton(
        Controller,
        logger=common.logger,
        device_manager=common.device.device_manager,
        mqtt_client=common.mqtt_client,
        device_status_checker=common.device.device_status_checker,
        scheduler=common.scheduler,
        health=common.health,
        container=common,
        arp_provider_factory=services.container.arp_provider_factory
    )
