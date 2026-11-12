from powerpi_common.sensor import Sensor
from zigpy.zcl import Cluster
from zigpy.zcl.clusters.measurement import RelativeHumidity, TemperatureMeasurement
from zigpy.zcl.foundation import Attribute
from zigpy.types import uint16_t

from zigbee_controller.sensor.metrics import Metric, MetricValue
from zigbee_controller.zigbee.device import ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeBatteryMixin, ZigbeeReportMixin


class ZigbeeEnvironmentSensor(Sensor, ZigbeeBatteryMixin, ZigbeeReportMixin, ZigbeeMixin):
    '''
    Adds support for ZigBee temperature and humidity combined sensors.
    '''

    def __init__(
        self,
        metrics: dict[Metric, MetricValue],
        poll_frequency: int | None = 120,
        **kwargs
    ):
        Sensor.__init__(self, **kwargs)
        ZigbeeMixin.__init__(self, **kwargs)

        self.__metrics = metrics
        self.__poll_frequency = poll_frequency

    @property
    def humidity_enabled(self):
        return MetricValue.is_enabled(self.__metrics, Metric.HUMIDITY)

    @property
    def temperature_enabled(self):
        return MetricValue.is_enabled(self.__metrics, Metric.TEMPERATURE)

    def on_report(self, cluster: Cluster, attribute: Attribute):
        ZigbeeBatteryMixin.on_report(self, cluster, attribute)

        def broadcast_attribute(
            flag: bool,
            cluster_id: uint16_t,
            name: str,
            unit: str,
            invalid: int
        ):
            if flag \
                    and cluster.cluster_id == cluster_id \
                    and attribute.attrid == cluster.attributes_by_name['measured_value'].id:
                value = attribute.value.value

                # is the value the invalid value for this measure?
                if value == invalid:
                    return

                # both are in hundredths of a unit
                value /= 100

                message = {'value': value, 'unit': unit}
                self._broadcast(name, message)

        broadcast_attribute(
            self.humidity_enabled,
            RelativeHumidity.cluster_id,
            'humidity',
            '%',
            0xFFFF
        )

        broadcast_attribute(
            self.temperature_enabled,
            TemperatureMeasurement.cluster_id,
            'temperature',
            '°C',
            0x8000
        )

    async def initialise(self):
        await ZigbeeBatteryMixin.initialise(self)

        device = self._zigbee_device

        clusters: list[Cluster] = []

        if self.humidity_enabled:
            clusters.append(device[1].in_clusters[RelativeHumidity.cluster_id])
        if self.temperature_enabled:
            clusters.append(
                device[1].in_clusters[TemperatureMeasurement.cluster_id]
            )

        for cluster in clusters:
            await self._register_reports(
                cluster,
                ['measured_value'],
                self.__poll_frequency
            )

    def __str__(self):
        return ZigbeeMixin.__str__(self)
