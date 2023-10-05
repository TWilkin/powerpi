from powerpi_common.config import Config
from powerpi_common.device.consumers import SceneEventConsumer
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
        listener=True,
        **kwargs
    ):
        self.__additional_state = SceneState()

        Device.__init__(self, config, logger, mqtt_client, listener, **kwargs)

        if listener:
            # add listener for scene changes
            mqtt_client.add_consumer(SceneEventConsumer(self, config, logger))

    @property
    def scene(self):
        '''
        Returns the current scene of this device.
        '''
        return self.__additional_state.scene

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
        new_scene: str,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        '''
        Update the scene of this device to new_scene, the state to new_state and
        update the additional state to new_additional_state but do not broadcast 
        to the message queue.
        '''
        self.update_state_no_broadcast(new_state)
        self.__additional_state.scene = new_scene
        self.__additional_state.state = self._filter_keys(new_additional_state)

    def get_additional_state_for_scene(self, scene: str | None):
        '''
        Return the additional state for the specified scene.
        '''
        _, additional_state = self.__additional_state.get_scene_state(scene)
        return additional_state

    def set_state_and_additional(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        '''
        Update the state of this device to new_state, update the additional state
        to new_additional_state and broadcast the changes to the message queue.
        '''
        if new_additional_state is not None:
            new_additional_state = self._filter_keys(new_additional_state)

            if len(new_additional_state) > 0:
                self.__additional_state.state = new_additional_state

        if new_state is not None:
            self.update_state_no_broadcast(new_state)

        self._broadcast_state_change()

    def set_scene_additional_state(
        self,
        scene: str | None,
        new_additional_state: AdditionalState
    ):
        '''
        Update the additional state for the specified scene.
        '''
        self.__additional_state.update_scene_state(scene, new_additional_state)

    async def change_scene(self, new_scene: str):
        '''
        Switch this device from the current scene to this new one, and apply any state changes.
        '''
        if not self._is_current_scene(new_scene):
            old_scene_additional_state = {**self.__additional_state.state}

            self.__additional_state.scene = new_scene

            # join the old scene's state with the updated keys from the new, to ensure states
            # that don't change with the scene are not changed
            new_additional_state = {
                **old_scene_additional_state,
                **self.__additional_state.state
            }

            await self.change_power_and_additional_state(
                scene=new_scene,
                new_additional_state=new_additional_state
            )

    def _format_state(self):
        result = Device._format_state(self)

        if self.__additional_state.state:
            result = {**result, **self.__additional_state.format_scene_state()}

        # only include scenes if we have > just the current and they have additional state
        scenes = list(filter(
            lambda scene:
                not self.__additional_state.is_current_scene(scene)
                and len(self.__additional_state.get_scene_state(scene)) >= 1,
            self.__additional_state.scenes
        ))
        if len(scenes) >= 1:
            result['scenes'] = {
                scene: {
                    key: value
                    for key, value in self.__additional_state.format_scene_state(scene).items()
                    if key not in 'scene'
                }
                for scene in scenes
            }

        return result

    def _is_current_scene(self, scene: str | None):
        '''
        Returns whether the specified scene is the current scene or not.
        '''
        return self.__additional_state.is_current_scene(scene)
