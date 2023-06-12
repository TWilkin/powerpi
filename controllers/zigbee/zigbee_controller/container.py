from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer

from zigbee_controller.__version__ import __app_name__, __version__
from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.controller import Controller
from zigbee_controller.device.container import DeviceContainer


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        ZigbeeConfig
    )

    common = providers.Container(
        CommonContainer,
        app_name=__app_name__,
        version=__version__,
        config=config
    )

    device = providers.Container(
        DeviceContainer,
        config=config,
        logger=common.logger
    )

    controller = providers.Singleton(
        Controller,
        config=config,
        logger=common.logger,
        config_retriever=common.config_retriever,
        device_manager=common.device.device_manager,
        event_manager=common.event_manager,
        mqtt_client=common.mqtt_client,
        device_status_checker=common.device.device_status_checker,
        scheduler=common.scheduler,
        health=common.health,
        zigbee_controller=device.zigbee_controller
    )
