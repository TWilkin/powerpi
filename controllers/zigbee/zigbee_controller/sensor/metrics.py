from enum import StrEnum, unique
from typing import Dict, TypeVar


@unique
class Metric(StrEnum):
    DOOR = 'door'
    POWER = 'power'
    CURRENT = 'current'
    VOLTAGE = 'voltage'
    WINDOW = 'window'


MetricValueT = TypeVar('MetricValueT', bound='MetricValue')


@unique
class MetricValue(StrEnum):
    NONE = 'none'
    READ = 'read'
    VISIBLE = 'visible'

    @staticmethod
    def is_enabled(metrics: Dict[Metric, MetricValueT], value: MetricValueT):
        return value in metrics and metrics[value] in [MetricValue.READ, MetricValue.VISIBLE]
