from abc import ABC, abstractmethod
from typing import Any, Dict, List

from powerpi_common.device.types import DeviceStatus
from powerpi_common.util import await_or_sync


AdditionalState = Dict[str, Any]


class AdditionalStateMixin(ABC):
    '''
    Mixin to add additional state functionality. When change/status messages
    are received alternate state update methods are called from this mixin
    to allow an implementing device to set additional as well as power state.
    '''
    async def change_power_and_additional_state(self, new_state: DeviceStatus, new_additional_state: AdditionalState):
        '''
        Turn this device on or off, depending on the value of new_state
        as well as performing additional action from additional state.
        If new_state and additional_state is none, do nothing.
        '''
        try:
            if new_state is not None:
                self._logger.info(f'Turning {new_state} device {self}')

                func = self._turn_on if new_state == DeviceStatus.ON else self._turn_off
                await await_or_sync(func)
            
            new_additional_state = self._filter_keys(new_additional_state)
            
            if len(new_additional_state) > 0:
                # there is other work to do
                new_additional_state = self._on_additional_state_change(new_additional_state)
            
            self.set_state_and_additional(new_state, new_additional_state)
        except Exception as e:
            self._logger.exception(e)
            return
        
    @property
    @abstractmethod
    def additional_state(self):
        '''
        Implement this method to support returning additional state.
        '''
        raise NotImplementedError

    @abstractmethod
    def set_state_and_additional(self, new_state: DeviceStatus, new_additional_state: AdditionalState):
        '''
        Update the state and additional state, then broadcast the message to the queue.
        '''
        raise NotImplementedError
    
    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        '''
        Called when a message is received that contains additional state.
        '''
        return await await_or_sync(self._on_additional_state_change, new_additional_state)
    
    @abstractmethod
    def _on_additional_state_change(self, new_additional_state: AdditionalState) -> AdditionalState:
        '''
        Handler for when the additional state changes, allowing the extending device to
        perform any action on the physical device.
        '''
        raise NotImplementedError
    
    def _filter_keys(self, new_additional_state: AdditionalState):
        keys = filter(
            lambda key: new_additional_state.get(key, None) is not None,
            [key for key in self._additional_state_keys()]
        )

        return { key: new_additional_state[key] for key in keys}
    
    @abstractmethod
    def _additional_state_keys(self) -> List[str]:
        '''
        Returns the list of additional state keys this device supports.
        '''
        raise NotImplementedError
