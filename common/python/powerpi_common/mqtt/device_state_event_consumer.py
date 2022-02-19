from powerpi_common.config import Config
from powerpi_common.logger import Logger
from .consumer import MQTTConsumer
from .types import MQTTMessage


class DeviceStateEventConsumer(MQTTConsumer):
    def __init__(self, topic: str, device, config: Config, logger: Logger):
        MQTTConsumer.__init__(
            self, topic, config, logger
        )
        self._device = device

    def _is_message_valid(self, device_name: str, state: str, timestamp: int = None):
        if timestamp is not None:
            valid = super().is_timestamp_valid(timestamp)
        else:
            valid = True

        if state is not None and state != 'on' and state != 'off':
            self._logger.error(f'Unrecognisable state {state}')
            valid = False

        if device_name is None or device_name.strip() == '':
            self._logger.error('Device is a required field')
            valid = False
        else:
            valid &= device_name == self._device.name

        return valid
    
    def _get_additional_state(self, message: MQTTMessage):
        result = message.copy()
        result.pop('state', None)
        result.pop('timestamp', None)
        return result
