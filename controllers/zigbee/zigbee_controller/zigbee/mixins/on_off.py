from powerpi_common.device import DeviceStatus
from zigpy.exceptions import DeliveryError
from zigpy.typing import DeviceType
from zigpy.zcl.clusters.general import OnOff as OnOffCluster


class ZigbeeOnOffMixin:
    '''
    Mixin to be used to provide utility methods when a device supports the OnOffCluster.
    '''

    async def _read_status(self, device: DeviceType):
        '''Retrieve the current status of the supplied device'''
        try:
            cluster: OnOffCluster = device[1].in_clusters[OnOffCluster.cluster_id]
            values, _ = await cluster.read_attributes(['on_off'])

            new_state = DeviceStatus.ON if values['on_off'] else DeviceStatus.OFF
        except DeliveryError:
            # we couldn't contact it so set to unknown
            new_state = DeviceStatus.UNKNOWN

        return new_state
