from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from .device import Device
from .mixin import AdditionalState, AdditionalStateMixin
from .types import DeviceStatus


class AdditionalStateDevice(Device, AdditionalStateMixin):
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
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__additional_state = None
    
    @property
    def additional_state(self):
        '''
        Returns the current additional state of this device.
        '''
        if self.__additional_state:
            return self.__additional_state
        
        return {}
    
    @additional_state.setter
    def additional_state(self, new_additional_state: AdditionalState):
        '''
        Update the additional state of this device to new_additional_state,
        and broadcast the change to the message queue.
        '''
        new_additional_state = self._filter_keys(new_additional_state)

        if len(new_additional_state) > 0:
            self.__additional_state = new_additional_state

            self._broadcast_state_change()
    
    def update_state_no_broadcast(self, new_state: DeviceStatus, new_additional_state: AdditionalState):
        '''
        Update the state of this device to new_state, update the additional state
        to new_additional_state but do not broadcast to the message queue.
        '''
        Device.update_state_no_broadcast(self, new_state)
        self.__additional_state = self._filter_keys(new_additional_state)
    
    def set_state_and_additional(self, state: DeviceStatus, new_additional_state: AdditionalState):
        '''
        Update the state of this device to new_state, update the additional state
        to new_additional_state and broadcast the changes to the message queue.
        '''
        if state is not None:
            Device.update_state_no_broadcast(self, state)
        
        new_additional_state = self._filter_keys(new_additional_state)

        if len(new_additional_state) > 0:
            self.__additional_state = new_additional_state

        self._broadcast_state_change()
    
    def _format_state(self):
        result = Device._format_state(self)

        if self.__additional_state:
            for key in self.__additional_state:
                to_json = getattr(self.__additional_state[key], 'to_json', None)

                if callable(to_json):
                    result[key] = to_json()
                else:
                    result[key] = self.__additional_state[key]
        
        return result
