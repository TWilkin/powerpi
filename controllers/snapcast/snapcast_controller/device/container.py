from dependency_injector import providers

from snapcast_controller.device.snapcast_client import SnapcastClientDevice
from snapcast_controller.device.snapcast_server import SnapcastServerDevice
from snapcast_controller.snapcast.snapcast_api import SnapcastAPI


def add_devices(container):
    common_container = container.common()
    device_container = common_container.device()

    setattr(
        device_container,
        'snapcast_api',
        providers.Factory(
            SnapcastAPI,
            logger=container.common.logger
        )
    )

    setattr(
        device_container,
        'snapcast_server_device',
        providers.Factory(
            SnapcastServerDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager,
            snapcast_api=container.common.device.snapcast_api
        )
    )

    setattr(
        device_container,
        'snapcast_client_device',
        providers.Factory(
            SnapcastClientDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager
        )
    )
