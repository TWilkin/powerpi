import powerpi_common

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTMessage
from powerpi_common.util import ismixin
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

            if ismixin(self._device, powerpi_common.device.additional_state.AdditionalStateDevice):
                new_additional_state = self._get_additional_state(message)

                await self._device.change_power_and_additional_state(new_state, new_additional_state)
            else:
                await self._device.change_power(new_state)
