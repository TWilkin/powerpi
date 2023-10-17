from dependency_injector import providers

from .snapcast_api import SnapcastAPI
from .snapcast_server import SnapcastServerDevice


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
            snapcast_api=container.common.device.snapcast_api
        )
    )
