from abc import abstractmethod
from asyncio import create_task

from powerpi_common.device.mixin import InitialisableMixin
from zigpy.device import Device as ZigPyDevice
from zigpy.endpoint import Status
from zigpy.exceptions import DeliveryError
from zigpy.zcl import Cluster

from zigbee_controller.zigbee import DeviceJoinListener, HandleMessageListener


class ZigbeeSleepyMixin(InitialisableMixin):
    '''
    Mixin to cancel initialisation and manually set endpoints and clusters for sleepy devices
    that fail initial pairing due to falling asleep during the initialisation.
    Expected to be used alongside ZigbeeMixin
    '''

    def __init__(self):
        self.__bound = False

    async def initialise(self):
        self._add_zigbee_listener(
            DeviceJoinListener(self.__device_joined)
        )

        self._add_zigbee_listener(
            HandleMessageListener(self.__handle_message)
        )

    @abstractmethod
    def _configure_device(self, device: ZigPyDevice):
        '''
        Implement this method to manually configure endpoints and clusters
        for sleepy devices that cannot complete the interview.
        Must set device.node_desc, add endpoints with clusters
        '''
        raise NotImplementedError

    @abstractmethod
    async def _bind_clusters(self):
        '''
        Implement this method to manually bind clusters
        for sleepy devices that cannot complete the interview.
        Use self._bind_cluster to handle bind failure.
        '''
        raise NotImplementedError

    async def _bind_cluster(self, cluster: Cluster):
        try:
            await cluster.bind()
        except (DeliveryError, TimeoutError):
            self.__bound = False

            self.log_exception(
                f'Failed to bind cluster {cluster.cluster_id:#04x}'
            )

    def __device_joined(self, device: ZigPyDevice):
        # we immediately cancel initialisation as it's not going to work
        device.cancel_initialization()

        # then we can setup the endpoints and clusters manually
        self._configure_device(device)

        # we need to set that everything is initialised
        for endpoint_id, endpoint in device.endpoints.items():
            if endpoint_id != 0:
                endpoint.status = Status.ZDO_INIT

        # once we're done, indicate it's initialised
        self._zigbee_controller.controller_application.device_initialized(
            device
        )

    def __handle_message(self, device: ZigPyDevice):
        if not self.__bound and device.ieee == self.ieee:
            self.__bound = True

            _ = create_task(self._bind_clusters())
