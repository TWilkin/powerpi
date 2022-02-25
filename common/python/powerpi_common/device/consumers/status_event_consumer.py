from powerpi_common.config import Config
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTMessage
from .device_event_consumer import DeviceEventConsumer


class DeviceStatusEventConsumer(DeviceEventConsumer):
    def __init__(self, device, config: Config, logger: Logger):
        topic = f'device/{device.name}/status'

        DeviceEventConsumer.__init__(
            self, topic, device, config, logger
        )

    def on_message(self, message: MQTTMessage, entity: str, _: str):
        if self._is_message_valid(entity, message.get('state')):
            new_power_state = message.pop('state', DeviceStatus.UNKNOWN)

            self._update_device(new_power_state)

    def _update_device(self, new_power_state: DeviceStatus):
        self._device.state = new_power_state
