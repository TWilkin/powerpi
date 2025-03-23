from abc import ABC
from asyncio import ensure_future
from typing import List

from zigpy.types import EUI64
from zigpy.typing import DeviceType
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Status

from zigbee_controller.zigbee import DeviceInitialisedListener


class ZigbeeBindMixin(ABC):
    '''
    Mixin to be used to bind to a cluster when the device joins the network.
    Handling the case where a device is off, or asleep when the binding is attempted.
    '''

    async def _bind(self, clusters: List[Cluster]):
        '''
        Bind to the specified clusters.
        '''

        remaining: List[Cluster] = []

        async def bind(cluster: Cluster):
            nonlocal remaining

            try:
                self.log_info('Binding to cluster %s', cluster.name)
                [status] = await cluster.bind()

                if status != Status.SUCCESS:
                    self.log_info('Failed to bind to cluster %s', cluster.name)
                    remaining.append(cluster)
                else:
                    self.log_info('Bound to cluster %s', cluster.name)
            except TimeoutError:
                self.log_info(
                    'Failed to bind to cluster %s, due to timeout', cluster.name
                )
                remaining.append(cluster)

        # attempt to bind now
        for cluster in clusters:
            await bind(cluster)

        if len(remaining) == 0:
            return

        def on_device_initialised(device: DeviceType):
            self.log_info('Device initialised, %s', device)
            nonlocal remaining

            ieee = EUI64(device.ieee)

            if ieee == self.ieee and device.nwk == self.nwk:
                self.log_info(
                    'Device initialised, binding remaining clusters, %s', device)
                ensure_future(self._bind(remaining))

        self._zigbee_controller.add_listener(
            DeviceInitialisedListener(on_device_initialised)
        )
