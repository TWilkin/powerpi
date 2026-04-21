from enum import StrEnum


class VariableType(StrEnum):
    DEVICE = 'device'
    GEOFENCE = 'geofence'
    PRESENCE = 'presence'
    SENSOR = 'sensor'
