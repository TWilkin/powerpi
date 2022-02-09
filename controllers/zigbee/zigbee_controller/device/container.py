from dependency_injector import containers, providers

from .zigbee_controller import ZigbeeController

class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    zigbee_controller = providers.Singleton(
        ZigbeeController,
        config=config,
        logger=logger
    )

def add_devices(container):
    pass
