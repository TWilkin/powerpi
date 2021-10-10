from ..config import Config
from ..logger import Logger
from . device_state_event_consumer import DeviceStateEventConsumer


class StatusEventConsumer(DeviceStateEventConsumer):

    def __init__(self, device, config: Config, logger: Logger):
        topic = 'device/{}/status'.format(device.name)
        DeviceStateEventConsumer.__init__(
            self, topic, device, config, logger
        )

    def on_message(self, _, __, message, entity, action):
        # check if we should respond to this message
        if action == 'status':
            if self._is_message_valid(entity, message.get('state')):
                self._update_device(message['state'])

    def _update_device(self, new_state):
        self._device.state = new_state
