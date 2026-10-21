from dependency_injector import containers, providers

from .hive_client import HiveClient


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    hive_client = providers.Factory(
        HiveClient,
        config=config,
        logger=logger
    )


def add_devices(container):
    pass
