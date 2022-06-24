from enum import Enum


class VariableType(str, Enum):
    DEVICE = 'device'
    SENSOR = 'sensor'
