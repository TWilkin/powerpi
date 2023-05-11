from datetime import date, datetime
from typing import List

from httpx import AsyncClient
from powerpi_common.logger import Logger, LogMixin


class BankHolidayService(LogMixin):
    '''
    Uses the gov.uk service to identify when UK bank holidays are.
    '''

    __api_url = 'https://www.gov.uk/bank-holidays.json'

    def __init__(
        self,
        logger: Logger
    ):
        self._logger = logger

        self.__holidays: List[date] = []

    @property
    def holidays(self):
        return self.__holidays

    async def update(self):
        '''
        Query the API to get the list of bank holidays
        '''

        self.__holidays = []

        async with AsyncClient() as client:
            response = await client.get(self.__api_url)

            json = response.json()

            # for now only support England & Wales
            events = json['england-and-wales']['events']
            for event in events:
                event_date = datetime.strptime(
                    event['date'],
                    '%Y-%m-%d'
                ).date()

                if event_date >= datetime.utcnow():
                    self.__holidays.append(event_date)

        self.log_info('Found %d bank holidays', len(self.__holidays))
