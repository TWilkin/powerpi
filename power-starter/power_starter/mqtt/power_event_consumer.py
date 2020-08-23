from datetime import datetime

from power_starter.devices import DeviceManager
from power_starter.mqtt import MQTTConsumer
from power_starter.util.logger import Logger

class PowerEventConsumer(MQTTConsumer):

    def __init__(self, config, topic):
        MQTTConsumer.__init__(self, topic)
        self.__config = config

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
        
        # turn the device on/off
        try:
            Logger.info('Turning device {:s} {:s}'.format(device_name, state))
            if state == 'on':
                device.turn_on()
            else:
                device.turn_off()
        except e:
            Logger.exception(e)
            return
    
    def __is_message_valid(self, device, state, timestamp):
        # check age of message is within cutoff
        now = int(datetime.utcnow().timestamp() * 1000)
        if timestamp < now - (self.__config.message_age_cutoff * 1000):
            Logger.info('Ignoring old message')
            return False
        
        return is_message_valid(device, state)


def is_message_valid(device, state):
    if state != 'on' and state != 'off':
        Logger.error('Unrecognisable state {:s}'.format(state))
        return False
    
    if device is None or device.strip() == '':
        Logger.error('Device is a required field')
        return False

    return True
