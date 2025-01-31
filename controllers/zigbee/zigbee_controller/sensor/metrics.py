from enum import StrEnum, unique


@unique
class Metric(StrEnum):
    POWER = 'power'
    CURRENT = 'current'
    VOLTAGE = 'voltage'


@unique
class MetricValue(StrEnum):
    NONE = 'none'
    READ = 'read'
    VISIBLE = 'visible'

    @staticmethod
    def is_enabled(value):
        return value in [MetricValue.READ, MetricValue.VISIBLE]
