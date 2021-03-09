from dependency_injector import containers, providers

from . import_energenie import import_energenie
from . manager import DeviceManager


class DeviceContainer(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    common = providers.Dependency()

    device_manager = providers.Singleton(
        DeviceManager,
        config=config,
        logger=logger,
        service_provider=service_provider
    )


def add_sockets(container):
    SocketDevice, SocketGroupDevice = import_energenie(
        container.config(), container.logger()
    )

    setattr(container, 'socket_factory', providers.Factory(
        SocketDevice,
        config=container.config,
        logger=container.logger,
        mqtt_client=container.common.mqtt_client
    ))

    setattr(container, 'socket_group_factory', providers.Factory(
        SocketGroupDevice,
        config=container.config,
        logger=container.logger,
        mqtt_client=container.common.mqtt_client,
        device_manager=container.device_manager
    ))
