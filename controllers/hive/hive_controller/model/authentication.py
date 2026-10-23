from dataclasses import dataclass

from hive_controller.util import parse

ALIAS_MAP = {
    'AuthenticationResult': 'result',
    'AccessToken': 'access_token',
    'IdToken': 'id_token',
    'RefreshToken': 'refresh_token'
}


@dataclass
class Tokens:
    access_token: str
    id_token: str
    refresh_token: str


@dataclass
class AuthenticationResult:
    result: Tokens

    @staticmethod
    def parse(data: dict):
        return parse(AuthenticationResult, ALIAS_MAP, data)
