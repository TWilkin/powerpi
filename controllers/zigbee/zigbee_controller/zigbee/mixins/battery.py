from powerpi_common.sensor.mixin import BatteryMixin
from zigpy.zcl.clusters.general import PowerConfiguration
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Attribute

from zigbee_controller.zigbee.mixins.report import ZigbeeReportMixin


class ZigbeeBatteryMixin(BatteryMixin, ZigbeeReportMixin):
    '''
    Add support for ZigBee devices supporting the Power battery monitoring cluster.
    Expected to be used alongside ZigbeeMixin.
    '''

    def on_report(self, cluster: Cluster, attribute: Attribute):
        if cluster.cluster_id != PowerConfiguration.cluster_id:
            return

        value = attribute.value.value
        if value == 0xFF:
            return

        # value is 0-200, so each 1 represents 0.5%
        value /= 2

        self.on_battery_change(value)

    async def initialise(self):
        device = self._zigbee_device

        cluster: PowerConfiguration = device[1].in_clusters[PowerConfiguration.cluster_id]

        attributes = [
            'battery_percentage_remaining'
        ]

        await self._register_reports(
            cluster,
            attributes,
            24 * 60 * 60  # 1 day
        )
