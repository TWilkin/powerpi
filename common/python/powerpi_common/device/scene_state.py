from enum import StrEnum, unique
from typing import Dict

from .mixin import AdditionalState


@unique
class ReservedScenes(StrEnum):
    DEFAULT = 'default'
    CURRENT = 'current'


class SceneState:
    '''
    Class to handle additional state, and which scenes they belong to for a device.
    All additional state updates and retrievals should come through here so the state for the 
    current scene is always returned.
    Caches the state for each scene as messages come through, indicating whether a device needs
    to actually play the change or not depending on the scene it is in.
    '''

    def __init__(self):
        self.__scene = ReservedScenes.DEFAULT

        self.__state: Dict[str, AdditionalState | None] = {
            ReservedScenes.DEFAULT: None
        }

    @property
    def scene(self):
        '''
        Returns the current scene for the device.
        '''
        return self.__scene

    @scene.setter
    def scene(self, new_scene: str):
        self.__scene = new_scene

        if new_scene not in self.__state:
            self.__state[new_scene] = None

    @property
    def scenes(self):
        '''
        Returns the scenes with state for the device.
        '''
        return list(self.__state.keys())

    @property
    def state(self):
        '''
        Returns the current additional state for the device.
        '''
        _, current_state = self.get_scene_state()
        return current_state

    @state.setter
    def state(self, new_state: AdditionalState):
        '''
        Update the additional state of this device to new_state.
        '''
        self.__state[self.__scene] = new_state

    def is_current_scene(self, scene: str | None = ReservedScenes.CURRENT):
        '''
        Returns whether the supplier scene is the current scene.
        None and 'current' are synonyms for whatever the current scene is.
        '''
        if scene is None or scene == ReservedScenes.CURRENT:
            return True

        return scene == self.__scene

    def get_scene_state(self, scene: str | None = ReservedScenes.CURRENT):
        '''
        Return the actual name of the scene and the state for the specified scene. 
        If None or 'current' is provided, return the name and state for the current scene.
        '''
        state = None

        if self.is_current_scene(scene):
            scene = self.__scene

        if scene in self.__state:
            state = self.__state[scene]
            if state is None:
                state = {}

        return scene, state

    def update_scene_state(
        self,
        scene: str | None = ReservedScenes.CURRENT,
        new_state: AdditionalState | None = None
    ):
        '''
        Update the state of the specified scene.
        '''
        if self.is_current_scene(scene):
            scene = self.__scene

        self.__state[scene] = new_state

    def format_scene_state(self, scene: str | None = ReservedScenes.CURRENT):
        '''
        Return an object representation for the specified scene.
        '''
        scene, state = self.get_scene_state(scene)

        result = {
            'scene': scene,
        }

        if state:
            for key in state:
                to_json = getattr(
                    state[key], 'to_json', None
                )

                if callable(to_json):
                    result[key] = to_json()
                else:
                    result[key] = state[key]

        return result

    def __str__(self):
        return f'[{", ".join([f"{self.format_scene_state(scene)}" for scene in self.scenes])}]'
