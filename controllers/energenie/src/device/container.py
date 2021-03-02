from dependency_injector import containers, providers

from . import_energenie import import_energenie
from . manager import DeviceManager


class DeviceContainer(containers.DeclarativeContainer):

    config = providers.Dependency()

    logger = providers.Dependency()

    service_provider = providers.Dependency()

    device_manager = providers.Singleton(
        DeviceManager,
        config=config,
        logger=logger,
        service_provider=service_provider
    )


def add_sockets(container):
    SocketDevice, SocketGroupDevice = import_energenie(
        container.common.config(), container.common.logger()
    )

    setattr(container, 'socket_factory', providers.Factory(
        SocketDevice,
        config=container.common.config,
        logger=container.common.logger,
        mqtt_client=container.common.mqtt_client
    ))

    setattr(container, 'socket_group_factory', providers.Factory(
        SocketGroupDevice,
        config=container.common.config,
        logger=container.common.logger,
        mqtt_client=container.common.mqtt_client,
        device_manager=container.device.device_manager
    ))
