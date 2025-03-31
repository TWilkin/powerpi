
from dataclasses import dataclass


@dataclass
class ZigbeeGroup:
    name: str
    group_id: int


@dataclass
class ZigbeeGroups:
    controller = ZigbeeGroup('controller', 36878)
