from datetime import datetime
from typing import Any, Callable, List

from zigpy.zcl.foundation import Attribute, ZCLHeader

from .zigbee_listener import ZigBeeListener


class ClusterAttributeListener(ZigBeeListener):
    def __init__(self, method: Callable[[int, Any, datetime], None]):
        ZigBeeListener.__init__(self, method)

    def attribute_updated(self, attribute_id: int, value: Any, date: datetime):
        self._listener(attribute_id, value, date)


class ClusterCommandListener(ZigBeeListener):
    def __init__(self, method: Callable[[int, int, List[Any]], None]):
        ZigBeeListener.__init__(self, method)

    def cluster_command(self, tsn: int, command_id: int, *args):
        self._listener(tsn, command_id, args)


class ClusterGeneralCommandListener(ZigBeeListener):
    def __init__(self, method: Callable[[ZCLHeader, List[List[Attribute]]], None]):
        ZigBeeListener.__init__(self, method)

    def general_command(self, hdr: ZCLHeader, args: List[List[Attribute]]):
        self._listener(hdr, args)
