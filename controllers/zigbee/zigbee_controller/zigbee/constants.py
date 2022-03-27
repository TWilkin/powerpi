from enum import Enum


class OnOff(int, Enum):
    OFF = 0
    ON = 1


class OpenClose(str, Enum):
    CLOSE = 'close',
    OPEN = 'open'
