from typing import Any

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.homeautomation import ElectricalMeasurement

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterAttributeListener, ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeReportMixin


class ZigbeeEnergyMonitorSensor(Sensor, ZigbeeReportMixin, ZigbeeMixin):
    def __init__(
        self,
        logger: Logger,
        mqtt_client: MQTTClient,
        zigbee_controller: ZigbeeController,
        poll_frequency: int | None = 120,
        power: bool | None = False,
        current: bool | None = False,
        voltage: bool | None = False,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, zigbee_controller, **kwargs)

        self._logger = logger

        self.__poll_frequency = poll_frequency
        self.__power = power
        self.__current = current
        self.__voltage = voltage

    def on_attribute_updated(self, attribute_id: int, value: Any):
        self.log_info('update!')
        self.log_info('attribute updated %d %s', attribute_id, value)

    async def initialise(self):
        device = self._zigbee_device

        cluster: ElectricalMeasurement = device[1].in_clusters[ElectricalMeasurement.cluster_id]

        cluster.add_listener(
            ClusterAttributeListener(self.on_attribute_updated)
        )

        attributes = []
        if self.__power:
            attributes.append('active_power')
        if self.__current:
            attributes.append('rms_current')
        if self.__voltage:
            attributes.append('rms_voltage')

        await self._register_reports(cluster, attributes, self.__poll_frequency)
