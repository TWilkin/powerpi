from dependency_injector import containers, providers

from .device_additional_state_action import device_additional_state_action
from .device_off_action import device_off_action
from .device_on_action import device_on_action
from .device_scene_action import device_scene_action
from .factory import ActionFactory


class ActionContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    mqtt_client = providers.Dependency()

    variable_manager = providers.Dependency()

    action_factory = providers.Singleton(
        ActionFactory,
        service_provider=service_provider
    )

    action_device_on = providers.Callable(
        device_on_action,
        mqtt_client=mqtt_client
    )

    action_device_off = providers.Callable(
        device_off_action,
        mqtt_client=mqtt_client
    )

    action_device_additional_state = providers.Callable(
        device_additional_state_action,
        mqtt_client=mqtt_client,
        variable_manager=variable_manager
    )

    action_device_scene = providers.Callable(
        device_scene_action,
        mqtt_client=mqtt_client
    )
