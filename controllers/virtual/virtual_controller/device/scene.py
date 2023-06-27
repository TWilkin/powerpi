from typing import Awaitable, Callable, List, Optional

from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import (AdditionalState, AdditionalStateMixin,
                                         DeviceOrchestratorMixin)
from powerpi_common.device.scene_state import ReservedScenes
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util import ismixin


class SceneDevice(Device, DeviceOrchestratorMixin):
    # pylint: disable=too-many-ancestors
    '''
    A device for applying a scene, and additional state to the supplied device.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        devices: List[str],
        state: AdditionalState,
        scene: Optional[str] = None,
        **kwargs
    ):
        # pylint: disable=too-many-arguments

        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, devices,
            capability=False
        )

        self.__state = state
        self.__scene = scene

    @property
    def scene(self):
        '''
        Return the name of the scene this device controls.
        '''
        return self.__scene if self.__scene is not None else self._name

    async def on_referenced_device_status(self, _, __):
        # we don't care if the device is on or off
        pass

    async def _turn_on(self):
        await self.__apply(self.__start_scene)

    async def _turn_off(self):
        await self.__apply(self.__revert_scene)

    async def __apply(self, func: Callable[[AdditionalStateMixin], Awaitable]):
        for device in self.devices:
            if ismixin(device, AdditionalStateMixin):
                await func(device)

    async def __start_scene(self, device: AdditionalStateMixin):
        '''
        Change the supplied device state for the scene and switch to that scene.
        '''
        await device.change_power_and_additional_state(
            scene=self.scene,
            new_additional_state=self.__state
        )

        await device.change_scene(self.scene)

    async def __revert_scene(self, device: AdditionalStateMixin):
        '''
        Revert the supplied device back to the default scene.
        '''
        await device.change_scene(ReservedScenes.DEFAULT)
