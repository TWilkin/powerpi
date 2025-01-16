from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.foundation import GeneralCommand, ZCLHeader
from zigpy.zcl.clusters.homeautomation import ElectricalMeasurement

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterGeneralCommandListener, ZigbeeMixin
from zigbee_controller.zigbee.mixins import AttributeReport, ZigbeeReportMixin


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

    def on_attribute_updated(self, frame: ZCLHeader, args: AttributeReport):
        if frame.command_id != GeneralCommand.Report_Attributes:
            return

        device = self._zigbee_device
        cluster: ElectricalMeasurement = device[1].in_clusters[ElectricalMeasurement.cluster_id]

        for attribute in args.attribute_reports:
            if self.__power and attribute.attrid == cluster.attributes_by_name['active_power'].id:
                message = {'value': attribute.value.value, 'unit': 'W'}
                self._broadcast('power', message)

            if self.__current and attribute.attrid == cluster.attributes_by_name['rms_current'].id:
                message = {'value': attribute.value.value, 'unit': 'mA'}
                self._broadcast('current', message)

            if self.__voltage and attribute.attrid == cluster.attributes_by_name['rms_voltage'].id:
                message = {'value': attribute.value.value, 'unit': 'V'}
                self._broadcast('voltage', message)

    async def initialise(self):
        device = self._zigbee_device

        cluster: ElectricalMeasurement = device[1].in_clusters[ElectricalMeasurement.cluster_id]

        cluster.add_listener(
            ClusterGeneralCommandListener(self.on_attribute_updated)
        )

        attributes = []
        if self.__power:
            attributes.append('active_power')
        if self.__current:
            attributes.append('rms_current')
        if self.__voltage:
            attributes.append('rms_voltage')

        await self._register_reports(cluster, attributes, self.__poll_frequency)
