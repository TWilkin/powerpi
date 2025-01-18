from enum import StrEnum, unique
from typing import Dict

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.homeautomation import ElectricalMeasurement
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Attribute

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeReportMixin


@unique
class Metric(StrEnum):
    POWER = 'power'
    CURRENT = 'current'
    VOLTAGE = 'voltage'


@unique
class MetricValue(StrEnum):
    NONE = 'none'
    READ = 'read'
    VISIBLE = 'visible'

    @staticmethod
    def is_enabled(value):
        return value in [MetricValue.READ, MetricValue.VISIBLE]


class ZigbeeEnergyMonitorSensor(Sensor, ZigbeeReportMixin, ZigbeeMixin):
    '''
    Add support for ZigBee Energy Monitoring sensors, supporting take periodic
    power, current and voltage readings.
    '''

    def __init__(
        self,
        logger: Logger,
        mqtt_client: MQTTClient,
        zigbee_controller: ZigbeeController,
        metrics: Dict[Metric, MetricValue],
        poll_frequency: int | None = 120,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, zigbee_controller, **kwargs)

        self._logger = logger

        self.__poll_frequency = poll_frequency
        self.__metrics = metrics

        self.__divisors = {}

    @property
    def power_enabled(self):
        return MetricValue.is_enabled(self.__metrics[Metric.POWER])

    @property
    def current_enabled(self):
        return MetricValue.is_enabled(self.__metrics[Metric.CURRENT])

    @property
    def voltage_enabled(self):
        return MetricValue.is_enabled(self.__metrics[Metric.VOLTAGE])

    def on_report(self, cluster: Cluster, attribute: Attribute):
        if cluster.cluster_id != ElectricalMeasurement.cluster_id:
            return

        def broadcast_attribute(
            flag: bool,
            attribute_name: str,
            divisor_name: str,
            invalid: bool,
            name: str,
            unit: str
        ):
            # pylint: disable=too-many-arguments
            if flag and attribute.attrid == cluster.attributes_by_name[attribute_name].id:
                value = attribute.value.value

                if invalid and value == 0xFFFF:
                    return

                divisor = self.__divisors.get(divisor_name, 1)
                if divisor is not None and divisor > 0:
                    value /= divisor

                message = {'value': value, 'unit': unit}
                self._broadcast(name, message)

        broadcast_attribute(
            self.power_enabled, 'active_power', 'power_divisor', False, 'power', 'W'
        )
        broadcast_attribute(
            self.current_enabled, 'rms_current', 'ac_current_divisor', True, 'current', 'A'
        )
        broadcast_attribute(
            self.voltage_enabled, 'rms_voltage', 'ac_voltage_divisor', True, 'voltage', 'V'
        )

    async def initialise(self):
        device = self._zigbee_device

        cluster: ElectricalMeasurement = device[1].in_clusters[ElectricalMeasurement.cluster_id]

        report_attributes = []
        divisor_attributes = []
        if self.power_enabled:
            report_attributes.append('active_power')
            divisor_attributes.append('power_divisor')
        if self.current_enabled:
            report_attributes.append('rms_current')
            divisor_attributes.append('ac_current_divisor')
        if self.voltage_enabled:
            report_attributes.append('rms_voltage')
            divisor_attributes.append('ac_voltage_divisor')

        if len(report_attributes) > 0:
            await self._register_reports(cluster, report_attributes, self.__poll_frequency)

            self.__divisors, _ = await cluster.read_attributes(divisor_attributes)

    def __str__(self):
        return ZigbeeMixin.__str__(self)
