from dependency_injector import containers, providers
from powerpi_common.container import Container as CommonContainer

from hive_controller.__version__ import __app_name__, __version__
from hive_controller.config import HiveConfig
from hive_controller.controller import Controller
from hive_controller.device import HiveClient
from hive_controller.device.container import DeviceContainer


class ApplicationContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        HiveConfig
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

    hive_client = providers.Factory(
        HiveClient,
        config=config,
        logger=common.logger
    )

    controller = providers.Singleton(
        Controller,
        config=config,
        logger=common.logger,
        device_manager=common.device.device_manager,
        mqtt_client=common.mqtt_client,
        device_status_checker=common.device.device_status_checker,
        scheduler=common.scheduler,
        health=common.health,
        container=common,
        app_name=__app_name__,
        version=__version__,
        hive_client=hive_client,
    )
