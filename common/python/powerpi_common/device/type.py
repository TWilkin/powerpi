from enum import Enum


class DeviceType(str, Enum):
    DEVICE = 'device'
    SENSOR = 'sensor'


class DeviceStatus(str, Enum):
    ON = 'on',
    OFF = 'off',
    UNKNOWN = 'unknown'
