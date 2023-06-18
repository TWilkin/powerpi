from powerpi_common.config import Config
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from .device import Device
from .mixin import AdditionalState, AdditionalStateMixin
from .scene_state import SceneState


class AdditionalStateDevice(Device, AdditionalStateMixin):
    # pylint: disable=too-many-ancestors

    '''
    Device implementation of AdditionalStateMixin to provide additional
    state functionality. 
    When change/status messages are received alternate state update methods 
    are called from this class to allow an implementing device to set 
    additional as well as power state.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        self.__additional_state = SceneState()

        Device.__init__(self, config, logger, mqtt_client, **kwargs)

    @property
    def additional_state(self):
        '''
        Returns the current additional state of this device.
        '''
        return self.__additional_state.state

    @additional_state.setter
    def additional_state(self, new_additional_state: AdditionalState):
        '''
        Update the additional state of this device to new_additional_state,
        and broadcast the change to the message queue.
        '''
        new_additional_state = self._filter_keys(new_additional_state)

        if len(new_additional_state) > 0:
            self.__additional_state.state = new_additional_state

            self._broadcast_state_change()

    def update_state_and_additional_no_broadcast(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        '''
        Update the state of this device to new_state, update the additional state
        to new_additional_state but do not broadcast to the message queue.
        '''
        self.update_state_no_broadcast(new_state)
        self.__additional_state.state = self._filter_keys(new_additional_state)

    def set_state_and_additional(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        '''
        Update the state of this device to new_state, update the additional state
        to new_additional_state and broadcast the changes to the message queue.
        '''
        new_additional_state = self._filter_keys(new_additional_state)

        if len(new_additional_state) > 0:
            self.__additional_state.state = new_additional_state

        if new_state is not None:
            self.update_state_no_broadcast(new_state)

        self._broadcast_state_change()

    def _format_state(self):
        result = Device._format_state(self)

        if self.__additional_state.state:
            result = {**result, **self.__additional_state.format_scene_state()}

        return result
