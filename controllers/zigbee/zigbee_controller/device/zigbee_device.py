from lazy import lazy
from zigpy.typing import DeviceType

from .zigbee_controller import ZigbeeController

class ZigbeeDevice(object):
    def __init__(
        self, 
        controller: ZigbeeController,
        ieee: str
    ):    
        self.__controller = controller
        self.__ieee = ieee
    
    @property
    def ieee(self):
        return self.__ieee
    
    @lazy
    def _zigbee_device(self) -> DeviceType:
        return self._controller.get_device(self.__ieee)
