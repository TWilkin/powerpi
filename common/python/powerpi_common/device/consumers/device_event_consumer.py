from copy import deepcopy
from typing import Union

from powerpi_common.config import Config
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTConsumer, MQTTMessage
from powerpi_common.typing import AdditionalStateDeviceType, DeviceType


class DeviceEventConsumer(MQTTConsumer):
    def __init__(
        self,
        topic: str,
        device: Union[DeviceType, AdditionalStateDeviceType],
        config: Config,
        logger: Logger
    ):
        MQTTConsumer.__init__(
            self, topic, config, logger
        )
        self._device = device

    def _is_message_valid(self, device_name: str, state: str, timestamp: int = None):
        if timestamp is not None:
            valid = super().is_timestamp_valid(timestamp)
        else:
            valid = True

        if state is not None and state != DeviceStatus.ON and state != DeviceStatus.OFF:
            self.log_error('Unrecognisable state %s', state)
            valid = False

        if device_name is None or device_name.strip() == '':
            self.log_error('Device is a required field')
            valid = False
        else:
            valid &= device_name == self._device.name

        return valid

    @classmethod
    def _get_additional_state(cls, message: MQTTMessage):
        result = deepcopy(message)

        result.pop('state', None)
        result.pop('timestamp', None)
        result.pop('scene', None)

        return result
