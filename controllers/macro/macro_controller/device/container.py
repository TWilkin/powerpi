from dependency_injector import containers, providers


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    logger = providers.Dependency()


def add_devices(container):
    device_container = container.common().device()
