from dependency_injector import containers, providers

from .zigbee_controller import ZigbeeController
from .zigbee_pairing import ZigbeePairingDevice


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    zigbee_controller = providers.Singleton(
        ZigbeeController,
        config=config,
        logger=logger
    )

def add_devices(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'zigbee_pairing_device',
        providers.Factory(
            ZigbeePairingDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            zigbee_controller=container.device.zigbee_controller
        )
    )
