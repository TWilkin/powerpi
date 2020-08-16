from power_starter.devices import DeviceManager
from power_starter.events import EventManager
from power_starter.mqtt import MQTTClient, MQTTConsumer
from power_starter.status import StatusChecker
from power_starter.util.config import Config
from power_starter.util.logger import Logger


class PowerEventConsumer(MQTTConsumer):

    def __init__(self, topic):
        MQTTConsumer.__init__(self, topic)

    # MQTT message callback
    def on_message(self, client, user_data, message, entity, action):      
        # check if we should respond to this message
        if action == 'change':
            if message['state'] != 'on' and message['state'] != 'off':
                Logger.error('Unrecognisable state {:s}'.format(message['state']))
                return
            if entity is None or entity.strip() == '':
                Logger.error('Device is a required field')
                return
            
            # attempt to power the device on/off
            self.__power(entity, message['state'])
    
    # change the power state of a device
    def __power(self, device_name, state):
        # get the device
        device = DeviceManager.get_device(device_name)
        if device is None:
            Logger.error('No such device {:s}'.format(device_name))
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

# main entry point for the application
def main():
    # initialise the logger
    Logger.initialise()

    # initialise the config
    config = Config()

    # the MQTT topics we're reading/writing to
    power_change_topic = '{}/device/+/change'.format(config.topic_base)
    power_status_topic = '{}/device/{}/status'.format(config.topic_base, '{deviceName}')

    # initialise and connect to MQTT
    client = MQTTClient()
    client.add_consumer('device/change', PowerEventConsumer(power_change_topic))
    power_state_change_producer = client.add_producer()
    client.connect(config.mqtt_address)

    # create a callback for power change events
    def on_power_state_change(device, state):
        # now publish that the state was changed
        topic = power_status_topic.format(deviceName = device)
        message = {
            'state': state
        }
        power_state_change_producer(topic, message)

    # initialise the DeviceManager and EventManager
    DeviceManager.load(config.devices['devices'], on_power_state_change)
    EventManager.load(config.events['events'], client, config)
    
    # start the StatusChecker
    status_checker = StatusChecker()
    status_checker.schedule()
    status_checker.loop_start()

    # loop while receiving messages
    client.loop()


# start the application
if __name__ == '__main__':
    main()
