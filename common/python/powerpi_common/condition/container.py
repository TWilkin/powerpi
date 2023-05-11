from dependency_injector import containers, providers

from .dates import BankHolidayService


class ConditionContainer(containers.DeclarativeContainer):
    __self__ = providers.Self()

    bank_holiday_service = providers.Singleton(
        BankHolidayService
    )
