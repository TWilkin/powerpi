import apyhiveapi

from dataclasses import dataclass

from apyhiveapi import Auth, Hive
from dacite import from_dict
from powerpi_common.logger import Logger, LogMixin

from hive_controller.config import HiveConfig


@dataclass
class Tokens:
    access_token: str
    id_token: str
    refresh_token: str


@dataclass
class AuthenticationResult:
    result: Tokens


ALIAS_MAP = {
    'AuthenticationResult': 'result',
    'AccessToken': 'access_token',
    'IdToken': 'id_token',
    'RefreshToken': 'refresh_token'
}


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

    async def connect(self):
        if self.__client is None:
            username = self.__config.hive_username
            password = self.__config.hive_password

            self.log_info('Logging into Hive')
            auth = Auth(username, password)
            result = self.__parse_tokens(await auth.login())

            await auth.device_registration()
            device_data = list((await auth.get_device_data())[:3])

            self.__client = Hive(username=username, password=password)

            self.log_info('Starting session')
            await self.__client.startSession({
                'tokens': {
                    'token': result.result.id_token,
                    'accessToken': result.result.access_token,
                    'refreshToken': result.result.refresh_token
                },
                'device_data': device_data
            })
            self.log_info('Session started')

            for device in self.__client.session.data.devices.values():
                self.log_info(device)

    def __parse_tokens(self, result: dict) -> AuthenticationResult:
        def remap_recursive(data: dict) -> dict | list:
            if isinstance(data, dict):
                return {
                    ALIAS_MAP.get(key, key): remap_recursive(value)
                    for key, value in data.items()
                }

            if isinstance(data, list):
                return [remap_recursive(item) for item in data]

            return data

        aliased = remap_recursive(result)

        return from_dict(AuthenticationResult, aliased)
