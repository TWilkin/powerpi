from enum import StrEnum


class DeviceConfigType(StrEnum):
    DEVICE = 'device'
    SENSOR = 'sensor'


class DeviceStatus(StrEnum):
    ON = 'on'
    OFF = 'off'
    UNKNOWN = 'unknown'
