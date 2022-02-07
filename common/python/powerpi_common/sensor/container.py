from dependency_injector import containers, providers

from .factory import SensorFactory
from .manager import SensorManager


class SensorContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Dependency()

    logger = providers.Dependency()

    sensor_factory = providers.Factory(
        SensorFactory,
        logger=logger,
        service_provider=service_provider
    )

    sensor_manager = providers.Singleton(
        SensorManager,
        config=config,
        logger=logger,
        factory=sensor_factory
    )

