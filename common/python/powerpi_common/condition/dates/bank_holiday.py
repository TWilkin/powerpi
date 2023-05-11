from datetime import date, datetime
from typing import List, Union

from httpx import AsyncClient
from powerpi_common.config import Config
from powerpi_common.logger import Logger, LogMixin


class BankHolidayService(LogMixin):
    '''
    Uses the gov.uk service to identify when UK bank holidays are.
    '''

    __api_url = 'https://www.gov.uk/bank-holidays.json'

    def __init__(
        self,
        config: Config,
        logger: Logger
    ):
        self.__config = config
        self._logger = logger

        self.__holidays: List[date] = []

    @property
    def holidays(self):
        return self.__holidays

    def is_bank_holiday(self, value: Union[date, datetime]):
        if isinstance(value, datetime):
            value = value.date()

        return value in self.__holidays

    async def update(self):
        '''
        Query the API to get the list of bank holidays
        '''

        self.__holidays = []

        region_key = self.__region_key
        if region_key is None:
            return

        async with AsyncClient() as client:
            response = await client.get(self.__api_url)

            json = response.json()

            # for now only support England & Wales
            events = json[region_key]['events']
            for event in events:
                event_date = datetime.strptime(
                    event['date'],
                    '%Y-%m-%d'
                ).date()

                if event_date >= datetime.utcnow().date():
                    self.__holidays.append(event_date)

        self.log_info('Found %d bank holidays', len(self.__holidays))

    @property
    def __region_key(self):
        region = self.__config.region

        if region in ('england', 'wales'):
            return 'england-and-wales'
        if region == 'scotland':
            return 'scotland'
        if region.startswith('northern') and region.endswith('ireland'):
            return 'northern-ireland'

        return None
