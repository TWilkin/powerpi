from dependency_injector import containers, providers

from . config import Config
from . logger import Logger


class Container(containers.DeclarativeContainer):

    config = providers.Singleton(
        Config
    )

    logger = providers.Singleton(
        Logger
    )
