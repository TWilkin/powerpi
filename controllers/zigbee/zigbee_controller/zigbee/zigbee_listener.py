from abc import ABC
from typing import Callable

from zigpy.typing import DeviceType


class ZigBeeListener(ABC):
    def __init__(self, method: Callable):
        self._listener = method


class DeviceAnnounceListener(ZigBeeListener):
    def __init__(self, method: Callable[[DeviceType], None]):
        ZigBeeListener.__init__(self, method)

    def device_announce(self, device: DeviceType):
        self._listener(device)
