import os

from powerpi_common.config import Config


class HiveConfig(Config):
    '''
    Config options for Hive controller.
    '''

    @property
    def hive_username(self) -> str | None:
        value = os.getenv('HIVE_USERNAME')
        return value

    @property
    def hive_password(self) -> str | None:
        if self.hive_username is not None:
            return self._secret('HIVE')

        return None
