from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTMessage
from .device_event_consumer import DeviceEventConsumer


class DeviceChangeEventConsumer(DeviceEventConsumer):
    def __init__(self, device, config: Config, logger: Logger):
        topic = f'device/{device.name}/change'

        DeviceEventConsumer.__init__(
            self, topic, device, config, logger
        )

    async def on_message(self, message: MQTTMessage, entity: str, _: str):
        if self._is_message_valid(entity, message.get('state'), message.get('timestamp')):
            new_state = message.get('state', None)

            await self._device.change_power(new_state)
