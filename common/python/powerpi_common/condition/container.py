from dependency_injector import containers, providers

from .parser import ConditionParser


class ConditionContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    config = providers.Dependency()

    logger = providers.Dependency()

    variable_manager = providers.Dependency()

    condition_parser = providers.Factory(
        ConditionParser,
        variable_manager=variable_manager
    )
