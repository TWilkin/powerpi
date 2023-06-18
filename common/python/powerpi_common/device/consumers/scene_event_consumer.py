from powerpi_common.config import Config
from powerpi_common.device.scene_state import ReservedScenes
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTMessage
from powerpi_common.typing import AdditionalStateDeviceType

from .device_event_consumer import DeviceEventConsumer


class SceneEventConsumer(DeviceEventConsumer):
    def __init__(
        self,
        device: AdditionalStateDeviceType,
        config: Config,
        logger: Logger
    ):
        topic = f'device/{device.name}/scene'

        DeviceEventConsumer.__init__(
            self, topic, device, config, logger
        )

    async def on_message(self, message: MQTTMessage, _: str, __: str):
        scene = message.get('scene', None)

        if scene is not None and scene is not ReservedScenes.CURRENT:
            await self._device.change_scene(scene)
