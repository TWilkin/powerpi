
from datetime import timedelta

import apyhiveapi

from apyhiveapi import Auth, Hive
from apyhiveapi.helper.hivedataclasses import Device
from powerpi_common.logger import Logger, LogMixin

from hive_controller.config import HiveConfig
from hive_controller.model import AuthenticationResult


class HiveClient(LogMixin):
    '''
    A client for connecting to the Hive API.
    '''

    def __init__(
        self,
        config: HiveConfig,
        logger: Logger
    ):
        self._logger = logger
        self._logger.add_logger(apyhiveapi.api.hive_api.__name__)

        self.__config = config

        self.__client: Hive | None = None
        self.__devices: list[Device] = []

    @property
    def client(self):
        return self.__client

    @property
    def devices(self) -> list[Device]:
        '''
        Returns the list of devices connected to Hive.
        '''
        return self.__devices

    async def connect(self):
        if self.__client is None:
            username = self.__config.hive_username
            password = self.__config.hive_password

            self.log_info('Logging into Hive')
            auth = Auth(username, password)
            result = AuthenticationResult.parse(await auth.login())

            await auth.device_registration()
            device_data = list((await auth.get_device_data())[:3])

            self.__client = Hive(username=username, password=password)

            self.log_info('Starting session')
            device_list = await self.__client.startSession({
                'tokens': {
                    'token': result.result.id_token,
                    'accessToken': result.result.access_token,
                    'refreshToken': result.result.refresh_token
                },
                'device_data': device_data
            })
            self.log_info('Session started')

            for _, devices in device_list.items():
                for device in devices:
                    self.__devices.append(device)

    async def set_update_interval(self, interval: int):
        '''
        Override the update interval, if it's less than current so refreshes happen frequently
        enough for the lowest interval
        '''
        if interval < self.__client.config.scanInterval.seconds:
            self.log_info(f'Setting Hive update interval to {interval}s')
            await self.__client.updateInterval(timedelta(seconds=interval))
