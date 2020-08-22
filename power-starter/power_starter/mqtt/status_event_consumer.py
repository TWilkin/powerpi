from power_starter.devices import DeviceManager
from power_starter.mqtt import MQTTConsumer
from power_starter.mqtt.power_event_consumer import is_message_valid
from power_starter.util.logger import Logger

class StatusEventConsumer(MQTTConsumer):

    def __init__(self, topic):
        MQTTConsumer.__init__(self, topic)
    
    def on_message(self, client, user_data, message, entity, action):
        # check if we should respond to this message
        if action == 'status':
            if is_message_valid(entity, message['state']):           
                self._update_device(entity, message['state'])
        
    def _update_device(self, device_name, state):
        # get the device
        device = DeviceManager.get_device(device_name)
        if device is None:
            return
        
        device.status = state
