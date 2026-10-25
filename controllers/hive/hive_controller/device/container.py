from dependency_injector import containers, providers

from .hive_thermostat_device import HiveThermostatDevice


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()


def add_devices(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'hive_thermostat_device',
        providers.Factory(
            HiveThermostatDevice,
            config=container.config,
            hive_client=container.hive_client
        )
    )
