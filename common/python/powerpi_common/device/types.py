from enum import Enum


class DeviceConfigType(str, Enum):
    DEVICE = 'device'
    SENSOR = 'sensor'


class DeviceStatus(str, Enum):
    ON = 'on'
    OFF = 'off'
    UNKNOWN = 'unknown'


class PresenceStatus(str, Enum):
    DETECTED = 'detected'
    UNDETECTED = 'undetected'
    UNKNOWN = 'unknown'
