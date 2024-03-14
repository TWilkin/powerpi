from dependency_injector import containers, providers

from .action_device_additional_state import action_device_additional_state
from .action_device_power import action_device_power
from .action_device_scene import action_device_scene
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

    action_device_power = providers.Callable(
        action_device_power,
        mqtt_client=mqtt_client
    )

    action_device_additional_state = providers.Callable(
        action_device_additional_state,
        mqtt_client=mqtt_client,
        variable_manager=variable_manager
    )

    action_device_scene = providers.Callable(
        action_device_scene,
        mqtt_client=mqtt_client
    )
