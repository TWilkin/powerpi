from abc import ABC
from typing import Callable

from zigpy.device import Device as ZigPyDevice
from zigpy.zcl.clusters import Cluster


class ZigBeeListener(ABC):
    def __init__(self, method: Callable):
        self._listener = method


class ConnectionLostListener(ZigBeeListener):
    def __init__(self, method: Callable[[Exception], None]):
        ZigBeeListener.__init__(self, method)

    def connection_lost(self, exc: Exception):
        self._listener(exc)


class DeviceAnnounceListener(ZigBeeListener):
    def __init__(self, method: Callable[[ZigPyDevice], None]):
        ZigBeeListener.__init__(self, method)

    def device_announce(self, device: ZigPyDevice):
        self._listener(device)


class DeviceJoinListener(ZigBeeListener):
    def __init__(self, method: Callable[[ZigPyDevice], None]):
        ZigBeeListener.__init__(self, method)

    def device_joined(self, device: ZigPyDevice):
        self._listener(device)


class AttributeListener(ZigBeeListener):
    def __init__(self, method: Callable[[ZigPyDevice, Cluster, int, any], None]):
        ZigBeeListener.__init__(self, method)

    def device_attribute_updated(
        self,
        device: ZigPyDevice,
        cluster: Cluster,
        attribute_id: int,
        value: any
    ):
        self._listener(device, cluster, attribute_id, value)


class HandleMessageListener(ZigBeeListener):
    def __init__(self, method: Callable[[ZigPyDevice], None]):
        ZigBeeListener.__init__(self, method)

    def handle_message(
        self,
        device: ZigPyDevice,
        profile: int,
        cluster: int,
        src_ep: int,
        dst_ep: int,
        message: bytes,
    ):
        self._listener(device)
