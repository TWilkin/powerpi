from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterCommandListener, ZigbeeMixin
from zigbee_controller.zigbee.mixins.bind import ZigbeeBindMixin


class IkeaStyrbarRemote(Sensor, ZigbeeMixin, ZigbeeBindMixin):
    '''
    Adds support for IKEA Styrbar remote.
    '''

    def __init__(
        self,
        logger: Logger,
        zigbee_controller: ZigbeeController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, zigbee_controller, **kwargs)

        self._logger = logger

    async def initialise(self):
        device = self._zigbee_device

        await self._bind([device[1].out_clusters[OnOffCluster.cluster_id]])

        device[1].out_clusters[OnOffCluster.cluster_id].add_listener(
            ClusterCommandListener(
                lambda x, y, z: self.log_info(f'[{x}], [{y}], [{z}]'))
        )

    def __str__(self):
        return ZigbeeMixin.__str__(self)
