from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigpy.exceptions import DeliveryError
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin


class ZigbeeSocket(Device, PollableMixin, ZigbeeMixin):
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
        device = self._zigbee_device
        changed = False

        try:
            # get the power state
            cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]
            values, _ = await cluster.read_attributes(['on_off'])
            new_state = DeviceStatus.ON if values['on_off'] else DeviceStatus.OFF
            changed = new_state != self.state
        except DeliveryError:
            # we couldn't contact it so set to unknown
            new_state = DeviceStatus.UNKNOWN
            changed = new_state != self.state

        if changed:
            await self.set_new_state(new_state)

    async def initialise(self):
        pass

    async def _turn_on(self):
        await self.__set_power_state(DeviceStatus.ON)

    async def _turn_off(self):
        await self.__set_power_state(DeviceStatus.OFF)

    async def __set_power_state(self, new_state: DeviceStatus):
        device = self._zigbee_device

        cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]

        name = 'on' if new_state == DeviceStatus.ON else 'off'
        command = cluster.commands_by_name[name].id

        return await self._send_command(cluster, command)

    def __str__(self):
        return ZigbeeMixin.__str__(self)
