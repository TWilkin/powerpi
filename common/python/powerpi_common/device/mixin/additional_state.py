from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from powerpi_common.device.types import DeviceStatus

AdditionalState = Dict[str, Any]


class AdditionalStateMixin(ABC):
    '''
    Mixin to add additional state functionality. When change/status messages
    are received alternate state update methods are called from this mixin
    to allow an implementing device to set additional as well as power state.
    '''

    async def change_power_and_additional_state(
        self,
        scene: Optional[str] = None,
        new_state: Optional[DeviceStatus] = None,
        new_additional_state: Optional[AdditionalState] = None
    ):
        '''
        Turn this device on or off, depending on the value of new_state
        as well as performing additional action from additional state.
        If new_state and additional_state is none, do nothing.
        '''
        # pylint: disable=broad-except
        try:
            # update additional state first
            if new_additional_state is not None and len(new_additional_state) > 0:
                if self._is_current_scene(scene):
                    new_additional_state = await self.on_additional_state_change(
                        new_additional_state
                    )
                else:
                    # update just the additional state for that scene
                    self.set_scene_additional_state(
                        scene, new_additional_state
                    )

            # then update state
            if new_state is not None:
                self.log_info(f'Turning {new_state} device {self}')

                func = self._turn_on if new_state == DeviceStatus.ON else self._turn_off
                await func()

            new_additional_state = self._filter_keys(new_additional_state)

            # hide the additional state change if it's for another scene
            update_additional_state = new_additional_state if self._is_current_scene(scene) \
                else None

            self.set_state_and_additional(new_state, update_additional_state)
        except Exception as ex:
            self.log_exception(ex)
            return

    @property
    @abstractmethod
    def scene(self):
        '''
        Returns the current scene of this device.
        '''
        raise NotImplementedError

    @property
    @abstractmethod
    def additional_state(self):
        '''
        Implement this method to support returning additional state.
        '''
        raise NotImplementedError

    @abstractmethod
    def update_state_and_additional_no_broadcast(
        self,
        new_scene: str,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        '''
        Update the scene of this device to new_scene, the state to new_state and
        update the additional state to new_additional_state but do not broadcast 
        to the message queue.
        '''
        raise NotImplementedError

    @abstractmethod
    def set_state_and_additional(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        '''
        Update the state and additional state, then broadcast the message to the queue.
        '''
        raise NotImplementedError

    @abstractmethod
    def set_scene_additional_state(
        self,
        scene: Optional[str],
        new_additional_state: AdditionalState
    ):
        '''
        Update the additional state for the specified scene.
        '''
        raise NotImplementedError

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        '''
        Handler for when the additional state changes, allowing the extending device to
        perform any action on the physical device.
        Must be async
        '''
        raise NotImplementedError

    def _filter_keys(self, new_additional_state: AdditionalState):
        keys = filter(
            lambda key: new_additional_state.get(key, None) is not None,
            list(self._additional_state_keys())
        )

        return {key: new_additional_state[key] for key in keys}

    @abstractmethod
    def _additional_state_keys(self) -> List[str]:
        '''
        Returns the list of additional state keys this device supports.
        '''
        raise NotImplementedError

    @abstractmethod
    def _is_current_scene(self, scene: Optional[str]):
        '''
        Returns whether the specified scene is the current scene or not.
        '''
        raise NotImplementedError
