from abc import ABC
from asyncio import ensure_future
from typing import List

from zigpy.typing import DeviceType
from zigpy.zcl.clusters import Cluster

from zigbee_controller.zigbee import DeviceInitialisedListener


class ZigbeeBindMixin(ABC):
    '''
    Mixin to be used to bind to a cluster when the device joins the network.
    '''

    async def bind(self, clusters: List[Cluster]):
        '''
        Bind to the specified clusters.
        '''

        remaining: List[Cluster] = []

        # attempt to bind now
        for cluster in clusters:
            try:
                self.log_info("Binding to cluster %s", cluster)
                await cluster.bind()
            except:
                self.log_info(
                    "Failed to bind to cluster %s, will retry on join", cluster
                )
                remaining.append(cluster)

        if len(remaining) == 0:
            return

        def on_device_initialised(device: DeviceType):
            if device.ieee == self.ieee and device.nwk == self.nwk:
                for cluster in clusters:
                    ensure_future(cluster.bind())

        self._zigbee_controller.add_listener(
            DeviceInitialisedListener(on_device_initialised)
        )
