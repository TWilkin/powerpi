from dependency_injector import containers, providers
from zigbee_controller.config import ZigbeeConfig

from .zigbee_light import ZigbeeLight
from .zigbee_pairing import ZigbeePairingDevice
from .zigbee_socket import ZigbeeSocket


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()


def add_devices(container):
    common_container = container.common()
    device_container = common_container.device()

    # override the config
    common_container.config.override(providers.Singleton(
        ZigbeeConfig
    ))

    setattr(
        device_container,
        'zigbee_pairing_device',
        providers.Factory(
            ZigbeePairingDevice,
            zigbee_controller=container.zigbee_controller
        )
    )

    setattr(
        device_container,
        'zigbee_light_device',
        providers.Factory(
            ZigbeeLight,
            controller=container.zigbee_controller
        )
    )

    setattr(
        device_container,
        'zigbee_socket_device',
        providers.Factory(
            ZigbeeSocket,
            controller=container.zigbee_controller
        )
    )
