from dependency_injector import containers, providers

from virtual_controller.device.condition import ConditionDevice
from virtual_controller.device.delay import DelayDevice
from virtual_controller.device.group import GroupDevice
from virtual_controller.device.factory import RemoteDeviceFactory
from virtual_controller.device.log import LogDevice
from virtual_controller.device.mutex import MutexDevice
from virtual_controller.device.remote import RemoteDevice
from virtual_controller.device.scene import SceneDevice
from virtual_controller.device.variable import VariableDevice


class DeviceContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    logger = providers.Dependency()


def add_devices(container):
    device_container = container.common().device()

    # override the factory
    device_container.device_factory.override(providers.Factory(
        RemoteDeviceFactory,
        logger=container.common.logger,
        service_provider=container.common.device.service_provider
    ))

    setattr(
        device_container,
        'condition_device',
        providers.Factory(
            ConditionDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager,
            variable_manager=container.common.variable.variable_manager
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
        'group_device',
        providers.Factory(
            GroupDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager
        )
    )

    setattr(
        device_container,
        'log_device',
        providers.Factory(
            LogDevice,
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
        'remote_device',
        providers.Factory(
            RemoteDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client
        )
    )

    setattr(
        device_container,
        'scene_device',
        providers.Factory(
            SceneDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client,
            device_manager=container.common.device.device_manager
        )
    )

    setattr(
        device_container,
        'variable_device',
        providers.Factory(
            VariableDevice,
            config=container.common.config,
            logger=container.common.logger,
            mqtt_client=container.common.mqtt_client
        )
    )
