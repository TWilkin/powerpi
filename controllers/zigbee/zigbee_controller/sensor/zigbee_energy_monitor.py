from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.smartenergy import Metering

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterGeneralCommandListener, ZigbeeMixin


class ZigbeeEnergyMonitor(Sensor, ZigbeeMixin):
    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

        self._logger = logger

    async def initialise(self):
        device = self._zigbee_device

        device[1].in_clusters[Metering.cluster_id].add_listener(
            ClusterGeneralCommandListener(
                lambda _, args: self.log_info('metering', args)
            )
        )
