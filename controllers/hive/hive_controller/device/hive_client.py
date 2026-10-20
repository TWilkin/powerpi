from apyhiveapi import Auth, Hive
from powerpi_common.logger import Logger, LogMixin


class HiveClient(LogMixin):
    '''
    A client for connecting to the Hive API.
    '''

    def __init__(
        self,
        logger: Logger
    ):
        self._logger = logger

        self.__client: Hive | None

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
            auth = Auth(username=self.user, password=self.password)
            tokens = await auth.login()

            self.__client = Hive(username=self.user, password=self.password)
            await self.__client.startSession({'tokens': tokens})
