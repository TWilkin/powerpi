from typing import Union

from powerpi_common.config import Config
from powerpi_common.device.mixin import AdditionalStateMixin
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTMessage
from powerpi_common.typing import AdditionalStateDeviceType, DeviceType
from powerpi_common.util import ismixin
from .device_event_consumer import DeviceEventConsumer


class DeviceStatusEventConsumer(DeviceEventConsumer):
    def __init__(
        self,
        device: Union[DeviceType, AdditionalStateDeviceType],
        config: Config,
        logger: Logger
    ):
        topic = f'device/{device.name}/status'

        DeviceEventConsumer.__init__(
            self, topic, device, config, logger
        )

    def on_message(self, message: MQTTMessage, entity: str, _: str):
        if self._is_message_valid(entity, message.get('state')):
            new_power_state = message.get('state', DeviceStatus.UNKNOWN)

            if ismixin(self._device, AdditionalStateMixin):
                new_additional_state = self._get_additional_state(message)

                self._device.set_state_and_additional(
                    new_power_state, new_additional_state
                )
            else:
                self._device.state = new_power_state
