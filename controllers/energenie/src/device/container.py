from dependency_injector import providers

from common.container import Container as CommonContainer

from . import_energenie import import_energenie
from . manager import DeviceManager


class Container(CommonContainer):

    deviceManager = providers.Singleton(
        DeviceManager
    )


def add_sockets(container):
    SocketDevice, SocketGroupDevice = import_energenie(
        container.config(), container.logger()
    )

    setattr(container, 'socket_factory', providers.Factory(
        SocketDevice,
        logger=container.logger
    ))

    setattr(container, 'socket_group_factory', providers.Factory(
        SocketGroupDevice,
        logger=container.logger,
        deviceManager=container.deviceManager
    ))
