from abc import abstractmethod

from powerpi_common.device.mixin import InitialisableMixin
from zigpy.device import Device as ZigPyDevice
from zigpy.endpoint import Status

from zigbee_controller.zigbee.zigbee_listener import DeviceJoinListener


class ZigbeeSleepyMixin(InitialisableMixin):
    '''
    Mixin to cancel initialisation and manually set endpoints and clusters for sleepy devices
    that fail initial pairing due to falling asleep during the initialisation.
    Expected to be used alongside ZigbeeMixin
    '''

    async def initialise(self):
        self._add_zigbee_listener(
            DeviceJoinListener(self.__device_joined)
        )

    @abstractmethod
    def _configure_device(self, device: ZigPyDevice):
        '''
        Implement this method to manually configure endpoints and clusters
        for sleepy devices that cannot complete the interview.
        Must set device.node_desc, add endpoints with clusters
        '''
        raise NotImplementedError

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
