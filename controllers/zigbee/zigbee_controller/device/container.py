from dependency_injector import containers, providers

from .zigbee import ZigbeeController

class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    zigbee_controller = providers.Factory(
        ZigbeeController,
        config=config
    )
