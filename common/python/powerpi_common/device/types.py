from enum import StrEnum, unique


@unique
class DeviceConfigType(StrEnum):
    DEVICE = 'device'
    SENSOR = 'sensor'


@unique
class DeviceStatus(StrEnum):
    ON = 'on'
    OFF = 'off'
    UNKNOWN = 'unknown'
