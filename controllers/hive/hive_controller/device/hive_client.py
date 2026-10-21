import apyhiveapi

from dataclasses import dataclass

from apyhiveapi import Auth, Hive
from dacite import from_dict
from powerpi_common.logger import Logger, LogMixin


@dataclass
class Tokens:
    AccessToken: str
    IdToken: str
    RefreshToken: str


@dataclass
class AuthenticationResult:
    AuthenticationResult: Tokens

    @classmethod
    def from_dict(cls, data: dict) -> 'AuthenticationResult':
        return from_dict(AuthenticationResult, data)


class HiveClient(LogMixin):
    '''
    A client for connecting to the Hive API.
    '''

    def __init__(
        self,
        logger: Logger
    ):
        self._logger = logger
        self._logger.add_logger(apyhiveapi.api.hive_api.__name__)

        self.__client: Hive | None = None

    @property
    def user(self):
        return self.__user

    @user.setter
    def user(self, user: str):
        self.__user = user

    @property
    def password(self):
        return self.__password

    @password.setter
    def password(self, password: str):
        self.__password = password

    async def connect(self):
        if self.__client is None:
            self.log_info('Logging into Hive')
            auth = Auth(username=self.user, password=self.password)
            result = AuthenticationResult.from_dict(await auth.login())

            await auth.device_registration()
            device_data = list((await auth.get_device_data())[:3])

            self.__client = Hive(username=self.user, password=self.password)

            self.log_info('Starting session')
            await self.__client.startSession({
                'tokens': {
                    'token': result.AuthenticationResult.IdToken,
                    'accessToken': result.AuthenticationResult.AccessToken,
                    'refreshToken': result.AuthenticationResult.RefreshToken
                },
                'device_data': device_data
            })
            self.log_info('Session started')

            for device in self.__client.session.data.devices.values():
                self.log_info(device)
