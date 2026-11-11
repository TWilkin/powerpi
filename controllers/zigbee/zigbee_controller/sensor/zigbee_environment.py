from powerpi_common.sensor import Sensor
from zigpy.zcl import Cluster
from zigpy.zcl.clusters.measurement import RelativeHumidity, TemperatureMeasurement
from zigpy.zcl.foundation import Attribute

from zigbee_controller.sensor.metrics import Metric, MetricValue
from zigbee_controller.zigbee.device import ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeReportMixin


class ZigbeeEnvironmentSensor(Sensor, ZigbeeReportMixin, ZigbeeMixin):
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
        self.log_info(cluster)
        self.log_info(attribute)

    async def initialise(self):
        device = self._zigbee_device

        humidity_cluster: RelativeHumidity = \
            device[1].in_clusters[RelativeHumidity.cluster_id]

        if self.humidity_enabled:
            await self._register_reports(
                humidity_cluster,
                ['measured_value'],
                self.__poll_frequency
            )

        temperature_cluster: TemperatureMeasurement = \
            device[1].in_clusters[TemperatureMeasurement.cluster_id]

        if self.temperature_enabled:
            await self._register_reports(
                temperature_cluster,
                ['measured_value'],
                self.__poll_frequency
            )

    def __str__(self):
        return ZigbeeMixin.__str__(self)
