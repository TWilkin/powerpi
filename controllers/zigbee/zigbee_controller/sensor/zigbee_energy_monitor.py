from typing import Any

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.homeautomation import ElectricalMeasurement

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterAttributeListener, ZigbeeMixin


class ZigbeeEnergyMonitorSensor(Sensor, ZigbeeMixin):
    def __init__(
        self,
        logger: Logger,
        mqtt_client: MQTTClient,
        zigbee_controller: ZigbeeController,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, zigbee_controller, **kwargs)

        self._logger = logger

    def on_attribute_updated(self, attribute_id: int, value: Any):
        self.log_info('attribute updated %d %s', attribute_id, value)

    async def initialise(self):
        device = self._zigbee_device

        cluster: ElectricalMeasurement = device[1].in_clusters[ElectricalMeasurement.cluster_id]

        await cluster.bind()

        cluster.add_listener(
            ClusterAttributeListener(self.on_attribute_updated)
        )

        await cluster.configure_reporting_multiple({
            'active_power': (60, 60 * 5, 1),
            'rms_voltage': (60, 60 * 5, 1),
            'rms_current': (60, 60 * 5, 1),
        })
