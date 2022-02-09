from typing import Callable, List


class ClusterListener(object):
    def __init__(self, method: Callable[[int, int, List[any]], None]):
        self.__listener = method


    def cluster_command(self, tsn: int, command_id: int, *args):
        self.__listener(tsn, command_id, args)
