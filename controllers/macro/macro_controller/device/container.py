from dependency_injector import containers, providers

from .composite import CompositeDevice
from .delay import DelayDevice
from .mutex import MutexDevice
from .test import TestDevice


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    logger = providers.Dependency()


def add_devices(container):
    device_container = container.common().device()

    setattr(
        device_container,
        'composite_device',
        providers.Factory(
            CompositeDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager
        )
    )

    setattr(
        device_container,
        'delay_device',
        providers.Factory(
            DelayDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client
        )
    )

    setattr(
        device_container,
        'mutex_device',
        providers.Factory(
            MutexDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager
        )
    )

    setattr(
        device_container,
        'test_device',
        providers.Factory(
            TestDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client
        )
    )
