from powerpi_common.device.mixin import InitialisableMixin
from zigbee_controller.device import ZigbeeController
from zigpy.types import EUI64
from zigpy.typing import DeviceType

from .zigbee_listener import ZigBeeListener


class ZigbeeMixin(InitialisableMixin):
    def __init__(
        self,
        controller: ZigbeeController,
        ieee: str,
        nwk: str,
        **_
    ):
        self.__controller = controller
        self.__ieee = EUI64.convert(ieee)
        self.__nwk = int(nwk, 16)

    @property
    def _zigbee_device(self) -> DeviceType:
        return self.__controller.get_device(self.__ieee, self.__nwk)

    def _add_zigbee_listener(self, listener: ZigBeeListener):
        self._zigbee_device.zdo.add_listener(listener)

    async def describe(self):
        return await self._zigbee_device.get_node_descriptor()

    def __str__(self):
        device = self._zigbee_device
        return f'{type(self).__name__}({self._display_name}, {device.manufacturer}, {device.model})'
