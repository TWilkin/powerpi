from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.homeautomation import ElectricalMeasurement
from zigpy.zcl.foundation import GeneralCommand, ZCLHeader

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

        self.__divisors = {}

    def on_attribute_updated(self, frame: ZCLHeader, args: AttributeReport):
        if frame.command_id != GeneralCommand.Report_Attributes:
            return

        device = self._zigbee_device
        cluster: ElectricalMeasurement = device[1].in_clusters[ElectricalMeasurement.cluster_id]

        def broadcast_attribute(
            flag: bool,
            attribute_name: str,
            divisor_name: str,
            invalid: bool,
            name: str,
            unit: str
        ):
            if flag and attribute.attrid == cluster.attributes_by_name[attribute_name].id:
                if invalid and attribute.value.value == 0xFFFF:
                    return

                value = attribute.value.value

                divisor = self.__divisors.get(divisor_name, 1)
                if divisor is not None and divisor > 0:
                    value /= divisor

                message = {'value': value, 'unit': unit}
                self._broadcast(name, message)

        for attribute in args.attribute_reports:
            broadcast_attribute(
                self.__power, 'active_power', 'power_divisor', False, 'power', 'W'
            )
            broadcast_attribute(
                self.__current, 'rms_current', 'ac_current_divisor', True, 'current', 'A'
            )
            broadcast_attribute(
                self.__voltage, 'rms_voltage', 'ac_voltage_divisor', True, 'voltage', 'V'
            )

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

        self.__divisors, _ = await cluster.read_attributes([
            'power_divisor', 'ac_current_divisor', 'ac_voltage_divisor'
        ])
