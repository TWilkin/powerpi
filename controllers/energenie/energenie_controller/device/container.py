from dependency_injector import containers, providers

from .import_energenie import import_energenie
from .socket import SocketDevice
from .socket_group import SocketGroupDevice


def add_devices(container):
    device_container = container.common().device()

    EnergenieInterface = import_energenie(
        container.config(), container.common().logger()
    )

    setattr(
        device_container,
        'energenie',
        providers.Factory(
            EnergenieInterface
        )
    )

    setattr(
        device_container,
        'socket_device',
        providers.Factory(
            SocketDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            energenie=container.common.device.energenie
        )
    )

    setattr(
        device_container,
        'socket_group_device',
        providers.Factory(
            SocketGroupDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager,
            energenie=container.common.device.energenie
        )
    )
