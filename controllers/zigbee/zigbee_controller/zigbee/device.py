from powerpi_common.device.mixin import InitialisableMixin
from zigbee_controller.device import ZigbeeController
from zigpy.exceptions import DeliveryError
from zigpy.types import EUI64, uint8_t
from zigpy.typing import DeviceType
from zigpy.zcl import Cluster
from zigpy.zcl.foundation import Status

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

    async def _send_command(self, cluster: Cluster, command: uint8_t, **kwargs):
        try:
            result = await cluster.command(command, **kwargs)

            if result.status != Status.SUCCESS:
                self.log_error(
                    f'Command {command:#04x} failed with status {result.status}'
                )

                return False
        except DeliveryError:
            return False

        return True

    def __str__(self):
        device = self._zigbee_device
        return f'{type(self).__name__}({self._display_name}, {device.manufacturer}, {device.model})'
