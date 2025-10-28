from abc import ABC
from typing import Callable

from zigpy.typing import DeviceType


class ZigBeeListener(ABC):
    def __init__(self, method: Callable):
        self._listener = method


class ConnectionLostListener(ZigBeeListener):
    def __init__(self, method: Callable[[Exception], None]):
        ZigBeeListener.__init__(self, method)

    def connection_lost(self, exc: Exception):
        self._listener(exc)


class DeviceAnnounceListener(ZigBeeListener):
    def __init__(self, method: Callable[[DeviceType], None]):
        ZigBeeListener.__init__(self, method)

    def device_announce(self, device: DeviceType):
        self._listener(device)


class DeviceJoinListener(ZigBeeListener):
    def __init__(self, method: Callable[[DeviceType], None]):
        ZigBeeListener.__init__(self, method)

    def device_joined(self, device: DeviceType):
        self._listener(device)
