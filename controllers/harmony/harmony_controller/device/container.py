from dependency_injector import containers, providers

from .harmony_hub import HarmonyHubDevice


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    mqtt_client = providers.Dependency()

    harmony_hub_device = providers.Factory(
        HarmonyHubDevice,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client,
        name='test'
    )
