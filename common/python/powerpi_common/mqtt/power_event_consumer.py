from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .device_state_event_consumer import DeviceStateEventConsumer
from .types import MQTTMessage


class PowerEventConsumer(DeviceStateEventConsumer):

    def __init__(self, device, config: Config, logger: Logger):
        topic = f'device/{device.name}/change'
        DeviceStateEventConsumer.__init__(
            self, topic, device, config, logger
        )

    # MQTT message callback
    async def on_message(self, message: MQTTMessage, entity: str, action: str):
        # check if we should respond to this message
        if action == 'change':
            if self._is_message_valid(entity, message.get('state'), message.get('timestamp')):
                new_state = message.get('state', None)
                new_additional_state = self._get_additional_state(message)

                await self._device.change_power_and_additional_state(new_state, new_additional_state)
