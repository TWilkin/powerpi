from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dependency_injector import containers, providers

from powerpi_common.condition import ConditionContainer
from powerpi_common.config.config_retriever import ConfigRetriever
from powerpi_common.controller import Controller
from powerpi_common.device import DeviceContainer
from powerpi_common.health import HealthService
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import VariableContainer


class Container(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    app_name = providers.Dependency()

    version = providers.Dependency()

    config = providers.Dependency()

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

    scheduler = providers.Singleton(
        AsyncIOScheduler
    )

    config_retriever = providers.Singleton(
        ConfigRetriever,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client
    )

    device = providers.Container(
        DeviceContainer,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client,
        scheduler=scheduler
    )

    variable = providers.Container(
        VariableContainer,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client,
        device_manager=device.device_manager
    )

    condition = providers.Container(
        ConditionContainer,
        config=config,
        logger=logger,
        variable_manager=variable.variable_manager
    )

    health = providers.Singleton(
        HealthService,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client,
        scheduler=scheduler
    )

    controller = providers.Singleton(
        Controller,
        logger=logger,
        config_retriever=config_retriever,
        device_manager=device.device_manager,
        mqtt_client=mqtt_client,
        device_status_checker=device.device_status_checker,
        scheduler=scheduler,
        health=health,
        app_name=app_name,
        version=version
    )
