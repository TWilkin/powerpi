from dependency_injector import containers, providers

from .zigbee import ZigbeeController

class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    zigbee_controller = providers.Factory(
        ZigbeeController,
        config=config,
        logger=logger
    )

def add_devices(container):
    pass
