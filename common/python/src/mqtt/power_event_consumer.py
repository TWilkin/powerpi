from ..config import Config
from ..logger import Logger
from . device_state_event_consumer import DeviceStateEventConsumer


class PowerEventConsumer(DeviceStateEventConsumer):

    def __init__(self, device, config: Config, logger: Logger):
        topic = 'device/{}/change'.format(device.name)
        DeviceStateEventConsumer.__init__(
            self, topic, device, config, logger
        )

    # MQTT message callback
    def on_message(self, client, user_data, message, entity, action):
        # check if we should respond to this message
        if action == 'change':
            if self._is_message_valid(entity, message['state'], message['timestamp']):
                # attempt to power the device on/off
                self.__power(message['state'])

    # change the power state of a device
    def __power(self, state: str):
        # turn the device on/off
        try:
            if state == 'on':
                self._device.turn_on()
            else:
                self._device.turn_off()
        except Exception as e:
            self._logger.exception(e)
            return
