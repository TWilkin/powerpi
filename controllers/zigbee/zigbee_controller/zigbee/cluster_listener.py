from typing import Any, Callable, List


class ClusterListener:
    def __init__(self, method: Callable[[int, int, List[Any]], None]):
        self.__listener = method

    def cluster_command(self, tsn: int, command_id: int, *args):
        self.__listener(tsn, command_id, args)
