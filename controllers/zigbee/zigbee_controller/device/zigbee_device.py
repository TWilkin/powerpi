from abc import ABC
from zigpy.types import EUI64
from zigpy.typing import DeviceType

from .zigbee_controller import ZigbeeController


class ZigbeeDevice(ABC):
    def __init__(
        self, 
        controller: ZigbeeController,
        ieee: str,
        nwk: str
    ):    
        self.__controller = controller
        self.__ieee = EUI64.convert(ieee)
        self.__nwk = int(nwk, 16)
    
    @property
    def _zigbee_device(self) -> DeviceType:
        return self.__controller.get_device(self.__ieee, self.__nwk)
    
    async def describe(self):
        return await self._zigbee_device.get_node_descriptor()

    def __str__(self):
        device = self._zigbee_device
        return f'{type(self).__name__}({self._display_name}, {device.manufacturer}, {device.model})'
