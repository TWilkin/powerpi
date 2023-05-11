from dependency_injector import containers, providers

from .dates import BankHolidayService
from .parser import ConditionParser


class ConditionContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    config = providers.Dependency()

    logger = providers.Dependency()

    variable_manager = providers.Dependency()

    bank_holiday_service = providers.Singleton(
        BankHolidayService,
        config=config,
        logger=logger
    )

    condition_parser = providers.Factory(
        ConditionParser,
        variable_manager=variable_manager
    )
