from enum import unique, IntEnum, StrEnum

MQTTMessage = dict[str, any]


@unique
class MQTTTopic(StrEnum):
    CONFIG = 'config'
    DEVICE = 'device'
    EVENT = 'event'
    PRESENCE = 'presence'
    GEOFENCE = 'geofence'


@unique
class MQTTConsumerPriority(IntEnum):
    # For a consumer storing the value, e.g. state updates
    VALUE = 0
    # For a consumer calculating new values e.g. conditions dependent on variables and change events
    LOGIC = 1
