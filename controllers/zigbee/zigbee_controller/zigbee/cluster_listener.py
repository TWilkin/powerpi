from abc import ABC
from typing import Any, Callable, List

from zigpy.zcl.foundation import Attribute, ZCLHeader


class ClusterListener(ABC):
    def __init__(self, method: Callable):
        self._listener = method


class ClusterCommandListener(ClusterListener):
    def __init__(self, method: Callable[[int, int, List[Any]], None]):
        ClusterListener.__init__(self, method)

    def cluster_command(self, tsn: int, command_id: int, *args):
        self._listener(tsn, command_id, args)


class ClusterGeneralCommandListener(ClusterListener):
    def __init__(self, method: Callable[[ZCLHeader, List[List[Attribute]]], None]):
        ClusterListener.__init__(self, method)

    def general_command(self, hdr: ZCLHeader, args: List[List[Attribute]]):
        print(args)
        self._listener(hdr, args)
