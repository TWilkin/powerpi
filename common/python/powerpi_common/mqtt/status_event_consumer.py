from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .device_state_event_consumer import DeviceStateEventConsumer


class StatusEventConsumer(DeviceStateEventConsumer):

    def __init__(self, device, config: Config, logger: Logger):
        topic = f'device/{device.name}/status'
        DeviceStateEventConsumer.__init__(
            self, topic, device, config, logger
        )

    async def on_message(self, _, __, message, entity, action):
        # check if we should respond to this message
        if action == 'status':
            if self._is_message_valid(entity, message.get('state')):
                new_power_state = message.pop('state', 'unknown')
                new_additional_state = self._get_additional_state(message)

                self._update_device(new_power_state, new_additional_state)

    def _update_device(self, new_power_state: str, new_additional_state: dict):
        self._device.set_state_and_additional(new_power_state, new_additional_state)
