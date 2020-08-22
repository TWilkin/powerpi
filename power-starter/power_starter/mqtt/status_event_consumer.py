from power_starter.devices import DeviceManager
from power_starter.mqtt import MQTTConsumer
from power_starter.util.logger import Logger

class StatusEventConsumer(MQTTConsumer):

    def __init__(self, topic):
        MQTTConsumer.__init__(self, topic)
    
    def on_message(self, client, user_data, message, entity, action):
        # check if we should respond to this message
        if action == 'status':
            if message['state'] != 'on' and message['state'] != 'off':
                Logger.error('Unrecognisable state {:s}'.format(message['state']))
                return
            if entity is None or entity.strip() == '':
                Logger.error('Device is a required field')
                return
            
            self._update_device(entity, message['state'])
        
    def _update_device(self, device_name, state):
        Logger.info('Updating' + device_name + ' ' + state)

        # get the device
        device = DeviceManager.get_device(device_name)
        if device is None:
            Logger.error('No such device {:s}'.format(device_name))
            return
        
        device.status = state
