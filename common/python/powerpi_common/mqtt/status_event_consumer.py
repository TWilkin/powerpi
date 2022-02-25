from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .device_state_event_consumer import DeviceStateEventConsumer
from .types import MQTTMessage


class StatusEventConsumer(DeviceStateEventConsumer):
    def __init__(self, device, config: Config, logger: Logger):
        topic = f'device/{device.name}/status'
        DeviceStateEventConsumer.__init__(
            self, topic, device, config, logger
        )

    def on_message(self, message: MQTTMessage, entity: str, action: str):
        # check if we should respond to this message
        if action == 'status':
            if self._is_message_valid(entity, message.get('state')):
                new_power_state = message.pop('state', 'unknown')

                self._update_device(new_power_state)

    def _update_device(self, new_power_state: str):
        self._device.state = new_power_state
