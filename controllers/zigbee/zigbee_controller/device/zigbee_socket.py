from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeOnOffMixin
from zigbee_controller.zigbee.constants import OnOff


class ZigbeeSocket(Device, PollableMixin, ZigbeeMixin, ZigbeeOnOffMixin):
    # pylint: disable=too-many-ancestors
    '''
    Add support for ZigBee sockets.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        controller: ZigbeeController,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

    async def poll(self):
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
