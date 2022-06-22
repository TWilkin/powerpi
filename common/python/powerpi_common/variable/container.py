from dependency_injector import containers, providers

from powerpi_common.variable.device import DeviceVariable
from powerpi_common.variable.manager import VariableManager


class VariableContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    mqtt_client = providers.Dependency()

    device_manager = providers.Dependency()

    variable_manager = providers.Singleton(
        VariableManager,
        logger=logger,
        device_manager=device_manager,
        service_provider=service_provider
    )

    device_variable = providers.Factory(
        DeviceVariable,
        config=config,
        logger=logger,
        mqtt_client=mqtt_client
    )
