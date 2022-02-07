from lazy import lazy
from zigpy.types import EUI64
from zigpy.typing import DeviceType

from .zigbee_controller import ZigbeeController

class ZigbeeDevice(object):
    def __init__(
        self, 
        controller: ZigbeeController,
        ieee: str,
        network: str
    ):    
        self.__controller = controller
        self.__ieee = EUI64.convert(ieee)
        self.__network = int(network, 16)

        self.__controller.register(self.__ieee, self.__network)
    
    @lazy
    def _zigbee_device(self) -> DeviceType:
        return self.__controller.get_device(self.__ieee, self.__network)
