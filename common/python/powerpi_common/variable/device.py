from typing import List

from powerpi_common.config import Config
from powerpi_common.device import DeviceStatus
from powerpi_common.device.consumers import DeviceStatusEventConsumer
from powerpi_common.device.mixin import AdditionalState, AdditionalStateMixin
from powerpi_common.device.scene_state import SceneState
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


class DeviceVariable(Variable, DeviceStatusEventConsumer, AdditionalStateMixin):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Variable.__init__(self, **kwargs)
        DeviceStatusEventConsumer.__init__(self, self, config, logger)

        self.__state = DeviceStatus.UNKNOWN
        self.__additional_state = SceneState()

        mqtt_client.add_consumer(self)

    @property
    def variable_type(self):
        return VariableType.DEVICE

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: str):
        self.__state = new_state

    @property
    def scene(self):
        return self.__additional_state.scene

    @scene.setter
    def scene(self, new_scene: str):
        self.__additional_state.scene = new_scene

    @property
    def additional_state(self):
        return self.__additional_state.state

    @additional_state.setter
    def additional_state(self, new_additional_state: AdditionalState):
        self.__additional_state.state = new_additional_state

    def get_additional_state_for_scene(self, scene: str | None):
        _, additional_state = self.__additional_state.get_scene_state(scene)
        return additional_state

    def update_state_and_additional_no_broadcast(
        self,
        new_scene: str,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        self.__additional_state.scene = new_scene
        self.__state = new_state
        self.__additional_state.state = new_additional_state

    async def change_scene(self, _: str):
        # ignore as we'll wait for a status message
        pass

    def set_state_and_additional(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        self.__state = new_state
        self.__additional_state.state = new_additional_state

    def set_scene_additional_state(
        self,
        scene: str | None,
        new_additional_state: AdditionalState
    ):
        self.__additional_state.update_scene_state(scene, new_additional_state)

    @property
    def json(self):
        return {'state': self.__state, **self.__additional_state.format_scene_state()}

    @property
    def suffix(self):
        return f'{self._name}'

    def _additional_state_keys(self) -> List[str]:
        # we don't know what the actual implementation supports, so we're not setting keys
        return []

    def _is_current_scene(self, scene: str | None):
        return self.__additional_state.is_current_scene(scene)
