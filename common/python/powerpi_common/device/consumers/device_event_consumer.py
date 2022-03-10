from copy import deepcopy

from powerpi_common.config import Config
from powerpi_common.device.base import BaseDevice
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTConsumer, MQTTMessage


class DeviceEventConsumer(MQTTConsumer):
    def __init__(self, topic: str, device: BaseDevice, config: Config, logger: Logger):
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
            self._logger.error(f'Unrecognisable state {state}')
            valid = False

        if device_name is None or device_name.strip() == '':
            self._logger.error('Device is a required field')
            valid = False
        else:
            valid &= device_name == self._device.name

        return valid
    
    def _get_additional_state(self, message: MQTTMessage):
        result = deepcopy(message)

        result.pop('state', None)
        result.pop('timestamp', None)
        
        return result
