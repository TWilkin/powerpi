from enum import StrEnum, unique


@unique
class PresenceStatus(StrEnum):
    PRESENT = 'present'
    ABSENT = 'absent'
    UNKNOWN = 'unknown'
