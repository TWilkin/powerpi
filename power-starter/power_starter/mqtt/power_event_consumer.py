from datetime import datetime
from threading import Thread

from power_starter.devices import DeviceManager
from power_starter.devices.remote_device import RemoteDevice
from power_starter.mqtt import MQTTConsumer
from power_starter.util.logger import Logger


class PowerEventConsumer(MQTTConsumer):

    def __init__(self, topic, message_age_cutoff):
        MQTTConsumer.__init__(self, topic, message_age_cutoff)

    # MQTT message callback
    def on_message(self, client, user_data, message, entity, action):
        # check if we should respond to this message
        if action == 'change':
            if self.__is_message_valid(entity, message['state'], message['timestamp']):
                # attempt to power the device on/off
                self.__power(entity, message['state'])

    # change the power state of a device
    def __power(self, device_name, state):
        # get the device
        device = DeviceManager.get_device(device_name)
        if device is None:
            return
        if type(device) is RemoteDevice:
            return

        def func():
            try:
                Logger.info('Turning device {:s} {:s}'.format(
                    device_name, state))
                if state == 'on':
                    device.turn_on()
                else:
                    device.turn_off()
            except Exception as e:
                Logger.exception(e)
                return

        Thread(target=func).start()

    def __is_message_valid(self, device, state, timestamp):
        return super().is_timestamp_valid(timestamp) and is_message_valid(device, state)


def is_message_valid(device, state):
    if state != 'on' and state != 'off':
        Logger.error('Unrecognisable state {:s}'.format(state))
        return False

    if device is None or device.strip() == '':
        Logger.error('Device is a required field')
        return False

    return True
