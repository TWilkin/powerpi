from dependency_injector import containers, providers

from . config import Config
from . logger import Logger


class Container(containers.DeclarativeContainer):

    __self__ = providers.Self()

    service_provider = providers.Singleton(
        __self__
    )

    config = providers.Singleton(
        Config
    )

    logger = providers.Singleton(
        Logger
    )
