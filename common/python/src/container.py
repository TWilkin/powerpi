from dependency_injector import containers, providers

from . config import Config


class Container(containers.DeclarativeContainer):

    config = providers.Singleton(
        Config
    )
