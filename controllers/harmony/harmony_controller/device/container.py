from dependency_injector import containers, providers

from .harmony_activity import HarmonyActivityDevice
from .harmony_client import HarmonyClient
from .harmony_hub import HarmonyHubDevice


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    logger = providers.Dependency()

    harmony_client = providers.Factory(
        HarmonyClient,
        logger=logger
    )


def add_devices(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'harmony_hub_device',
        providers.Factory(
            HarmonyHubDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager,
            harmony_client=container.device.harmony_client
        )
    )

    setattr(
        device_container,
        'harmony_activity_device',
        providers.Factory(
            HarmonyActivityDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager
        )
    )
