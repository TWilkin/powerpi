from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import NewPollableMixin
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.zigbee import ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeOnOffMixin
from zigbee_controller.zigbee.constants import OnOff


# pylint: disable=too-many-ancestors
class ZigbeeSocket(Device, NewPollableMixin, ZigbeeMixin, ZigbeeOnOffMixin):
    '''
    Add support for ZigBee sockets.
    '''

    def __init__(
        self,
        **kwargs
    ):
        Device.__init__(self, **kwargs)
        NewPollableMixin.__init__(self, **kwargs)
        ZigbeeMixin.__init__(self, **kwargs)

    async def _poll(self):
        new_state = await self._read_status()

        if new_state != self.state:
            await self.set_new_state(new_state)

    async def initialise(self):
        '''No need to initialise as the socket has no options.'''

    async def _turn_on(self):
        await self.__set_power_state(DeviceStatus.ON)

    async def _turn_off(self):
        await self.__set_power_state(DeviceStatus.OFF)

    async def __set_power_state(self, new_state: DeviceStatus):
        device = self._zigbee_device

        cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]

        return await self._send_command(cluster, OnOff.get(new_state))

    def __str__(self):
        return ZigbeeMixin.__str__(self)
