from dependency_injector import containers, providers

from .hive_client import HiveClient


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    logger = providers.Dependency()

    hive_client = providers.Factory(
        HiveClient,
        logger=logger
    )


def add_devices(container):
    pass
