from dependency_injector import providers

from energenie_controller.energenie import import_energenie
from .energenie_pairing import EnergeniePairingDevice
from .socket import SocketDevice
from .socket_group import SocketGroupDevice


def add_devices(container):
    device_container = container.common().device()

    energenie_interface_type = import_energenie(
        container.config(), container.common().logger()
    )

    setattr(
        device_container,
        'energenie',
        providers.Factory(
            energenie_interface_type
        )
    )

    setattr(
        device_container,
        'energenie_socket_device',
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
        'energenie_socket_group_device',
        providers.Factory(
            SocketGroupDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager,
            energenie=container.common.device.energenie
        )
    )

    setattr(
        device_container,
        'energenie_pairing_device',
        providers.Factory(
            EnergeniePairingDevice,
            config=container.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            energenie=container.common.device.energenie
        )
    )
