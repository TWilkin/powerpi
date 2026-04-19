from typing import TYPE_CHECKING

from dependency_injector import containers, providers
from powerpi_common.device import Device
from powerpi_common.sensor import Sensor

from .factory import DeviceFactory
from .manager import DeviceManager
from .status import DeviceStatusChecker

if TYPE_CHECKING:
    from powerpi_common.container import Container as CommonContainer


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    mqtt_client = providers.Dependency()

    scheduler = providers.Dependency()

    device_factory = providers.Factory(
        DeviceFactory,
        logger=logger,
        service_provider=service_provider
    )

    device_manager = providers.Singleton(
        DeviceManager,
        config=config,
        logger=logger,
        factory=device_factory
    )

    device_status_checker = providers.Singleton(
        DeviceStatusChecker,
        logger=logger,
        device_manager=device_manager,
        scheduler=scheduler
    )


def bind_common_device_dependencies(container: 'CommonContainer'):
    dependencies = {
        'config': container.config,
        'logger': container.logger,
        'mqtt_client': container.mqtt_client,
        'variable_manager': container.variable.variable_manager
    }

    for provider in container.device().traverse():
        if not isinstance(provider, providers.Factory) \
                or not isinstance(provider.cls, type) \
                or not issubclass(provider.cls, Device):
            continue

        provider.add_kwargs(**dependencies)


def bind_common_sensor_dependencies(container: 'CommonContainer'):
    dependencies = {
        'config': container.config,
        'logger': container.logger,
        'mqtt_client': container.mqtt_client
    }

    for provider in container.device().traverse():
        if not isinstance(provider, providers.Factory) \
                or not isinstance(provider.cls, type) \
                or not issubclass(provider.cls, Sensor):
            continue

        provider.add_kwargs(**dependencies)
