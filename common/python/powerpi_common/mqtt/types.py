from enum import unique, StrEnum

MQTTMessage = dict[str, any]


@unique
class MQTTTopic(StrEnum):
    CONFIG = 'config'
    DEVICE = 'device'
    EVENT = 'event'
    PRESENCE = 'presence'
    GEOFENCE = 'geofence'
