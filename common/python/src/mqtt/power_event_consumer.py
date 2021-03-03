from datetime import datetime

from ..config import Config
from ..device import Device
from ..logger import Logger
from . consumer import MQTTConsumer


class PowerEventConsumer(MQTTConsumer):

    def __init__(self, device: Device, config: Config, logger: Logger):
        MQTTConsumer.__init__(
            self, 'device/{}/change'.format(device.name), config, logger
        )
        self.__device = device

    # MQTT message callback
    def on_message(self, client, user_data, message, entity, action):
        # check if we should respond to this message
        if action == 'change':
            if self.__is_message_valid(entity, message['state'], message['timestamp']):
                # attempt to power the device on/off
                self.__power(entity, message['state'])

    # change the power state of a device
    def __power(self, device_name: str, state: str):
        # turn the device on/off
        try:
            self._logger.info('Turning device {:s} {:s}'
                              .format(device_name, state))

            if state == 'on':
                self.__device.turn_on()
            else:
                self.__device.turn_off()
        except e:
            self._logger.exception(e)
            return

    def __is_message_valid(self, device_name: str, state: str, timestamp: int):
        valid = super().is_timestamp_valid(timestamp)

        if state != 'on' and state != 'off':
            self._logger.error('Unrecognisable state {:s}'.format(state))
            valid = False

        if device_name is None or device_name.strip() == '':
            self._logger.error('Device is a required field')
            valid = False
        else:
            valid &= device_name == self.__device.name

        return valid
