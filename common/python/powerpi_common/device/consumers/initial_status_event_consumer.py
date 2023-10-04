from copy import deepcopy
from typing import Dict, Tuple

import powerpi_common
from powerpi_common.config import Config
from powerpi_common.device.mixin.additional_state import AdditionalState
from powerpi_common.device.scene_state import ReservedScenes
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from powerpi_common.typing import AdditionalStateDeviceType, DeviceType
from powerpi_common.util import ismixin

from .status_event_consumer import DeviceStatusEventConsumer


class DeviceInitialStatusEventConsumer(DeviceStatusEventConsumer):
    def __init__(
        self,
        device: 'DeviceType | AdditionalStateDeviceType',
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient
    ):
        DeviceStatusEventConsumer.__init__(
            self, device, config, logger
        )

        self.__active = True

        self.__mqtt_client = mqtt_client
        self.__mqtt_client.add_consumer(self)

    async def on_message(self, message: MQTTMessage, entity: str, _: str):
        if self.__active and self._is_message_valid(entity, message.get('state')):
            new_power_state = message.get('state', DeviceStatus.UNKNOWN)

            # don't broadcast as this is the device's initial state on startup
            if ismixin(self._device, powerpi_common.device.additional_state.AdditionalStateDevice):
                new_additional_state, new_scene, scenes = \
                    self.__extract(message)

                self._device.update_state_and_additional_no_broadcast(
                    new_scene, new_power_state, new_additional_state
                )

                for scene, additional_state in scenes.items():
                    self._device.set_scene_additional_state(
                        scene, additional_state
                    )
            else:
                self._device.update_state_no_broadcast(new_power_state)

            # remove this consumer as it has completed its job
            self.__active = False
            self.__mqtt_client.remove_consumer(self)

    def __extract(self, message: MQTTMessage) \
            -> Tuple[AdditionalState, str, Dict[str, AdditionalState]]:
        new_additional_state = self._get_additional_state(message)

        scene = message.get('scene', ReservedScenes.DEFAULT)

        scenes = deepcopy(message.get('scenes', {}))

        return new_additional_state, scene, scenes
