from typing import NamedTuple

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.exceptions import DeliveryError
from zigpy.zcl.clusters.homeautomation import ElectricalMeasurement
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Attribute

from zigbee_controller.sensor.metrics import Metric, MetricValue
from zigbee_controller.zigbee import ZigbeeController, ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeReportMixin


class MeasurementAttributes(NamedTuple):
    attribute: str
    multiplier: str
    divisor: str


ACTIVE_POWER = MeasurementAttributes(
    'active_power', 'ac_power_multiplier', 'ac_power_divisor'
)
RMS_CURRENT = MeasurementAttributes(
    'rms_current', 'ac_current_multiplier', 'ac_current_divisor'
)
RMS_VOLTAGE = MeasurementAttributes(
    'rms_voltage', 'ac_voltage_multiplier', 'ac_voltage_divisor'
)


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
        metrics: dict[Metric, MetricValue],
        poll_frequency: int | None = 120,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, zigbee_controller, **kwargs)

        self._logger = logger

        self.__poll_frequency = poll_frequency
        self.__metrics = metrics

        self.__scaling_attributes = {}

    @property
    def power_enabled(self):
        return MetricValue.is_enabled(self.__metrics, Metric.POWER)

    @property
    def current_enabled(self):
        return MetricValue.is_enabled(self.__metrics, Metric.CURRENT)

    @property
    def voltage_enabled(self):
        return MetricValue.is_enabled(self.__metrics, Metric.VOLTAGE)

    def on_report(self, cluster: Cluster, attribute: Attribute):
        if cluster.cluster_id != ElectricalMeasurement.cluster_id:
            return

        def broadcast_attribute(
            flag: bool,
            measurement: MeasurementAttributes,
            invalid: bool,
            name: str,
            unit: str
        ):
            if flag and attribute.attrid == cluster.attributes_by_name[measurement.attribute].id:
                value = attribute.value.value

                if invalid and value == 0xFFFF:
                    return

                multiplier = self.__scaling_attributes.get(
                    measurement.multiplier, 1
                )
                if multiplier is not None and multiplier > 0:
                    value *= multiplier

                divisor = self.__scaling_attributes.get(measurement.divisor, 1)
                if divisor is not None and divisor > 0:
                    value /= divisor

                message = {'value': value, 'unit': unit}
                self._broadcast(name, message)

        broadcast_attribute(
            self.power_enabled,
            ACTIVE_POWER,
            False,
            'power',
            'W'
        )
        broadcast_attribute(
            self.current_enabled,
            RMS_CURRENT,
            True,
            'current',
            'A'
        )
        broadcast_attribute(
            self.voltage_enabled,
            RMS_VOLTAGE,
            True,
            'voltage',
            'V'
        )

    async def initialise(self):
        device = self._zigbee_device

        cluster: ElectricalMeasurement = device[1].in_clusters[ElectricalMeasurement.cluster_id]

        attributes: list[MeasurementAttributes] = []
        scale_attributes = []
        if self.power_enabled:
            attributes.append(ACTIVE_POWER)
        if self.current_enabled:
            attributes.append(RMS_CURRENT)
        if self.voltage_enabled:
            attributes.append(RMS_VOLTAGE)

        if len(attributes) > 0:
            report_attributes = [
                attribute.attribute for attribute in attributes
            ]
            await self._register_reports(cluster, report_attributes, self.__poll_frequency)

            scale_attributes = [
                scale for attribute in attributes
                for scale in (attribute.multiplier, attribute.divisor)
            ]
            try:
                self.__scaling_attributes, _ = await cluster.read_attributes(scale_attributes)
            except (DeliveryError, TimeoutError):
                pass

    def __str__(self):
        return ZigbeeMixin.__str__(self)
