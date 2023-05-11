from powerpi_common.condition.dates import BankHolidayService
from powerpi_common.config import Config, ConfigFileType


class StartUpService:
    '''
    Class to handle starting optional components.
    '''

    def __init__(
        self,
        config: Config,
        service_provider
    ):
        self.__config = config
        self.__service_provider = service_provider

    async def start(self):
        used_config = self.__config.used_config

        # if conditions are usable
        if ConfigFileType.EVENTS in used_config or ConfigFileType.SCHEDULES in used_config:
            container = getattr(self.__service_provider, 'condition')
            bank_holiday: BankHolidayService = container.bank_holiday_service()

            await bank_holiday.update()
