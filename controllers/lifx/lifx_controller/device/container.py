from dependency_injector import containers, providers

from .lifx_client import LIFXClient
from .lifx_light import LIFXLightDevice


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    lifx_client = providers.Factory(
        LIFXClient
    )


def add_devices(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'lifx_light_device',
        providers.Factory(
            LIFXLightDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            lifx_client=container.device.lifx_client
        )
    )
