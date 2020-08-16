from power_starter.devices import DeviceManager
from power_starter.events import EventManager
from power_starter.mqtt import MQTTClient, MQTTConsumer
from power_starter.status import StatusChecker
from power_starter.util.config import Config
from power_starter.util.logger import Logger


# the MQTT topics we're reading/writing to
power_change_topic = 'home_change'
power_status_topic = 'home_status'

class PowerEventConsumer(MQTTConsumer):

    # MQTT message callback
    def on_message(self, client, user_data, message):      
        # check if we should respond to this message
        if message['type'] == 'power':
            if message['state'] != 'on' and message['state'] != 'off':
                Logger.error('Unrecognisable state {:s}'.format(message['state']))
                return
            if message['device'] is None or message['device'].strip() == '':
                Logger.error('Device is a required field')
                return
            
            # attempt to power the device on/off
            self.__power(message['device'], message['state'])
    
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

    # initialise and connect to MQTT
    client = MQTTClient()
    client.add_consumer(power_change_topic, PowerEventConsumer())
    power_state_change_producer = client.add_producer(power_status_topic)
    client.connect(config.mqtt_address)

    # create a callback for power change events
    def on_power_state_change(device, state):
        # now publish that the state was changed
        message = {
            'type': 'update',
            'device': device,
            'state': state
        }
        power_state_change_producer(message)

    # initialise the DeviceManager and EventManager
    DeviceManager.load(config.devices['devices'], on_power_state_change)
    EventManager.load(config.events['events'], client)
    
    # start the StatusChecker
    status_checker = StatusChecker()
    status_checker.schedule()
    status_checker.loop_start()

    # loop while receiving messages
    client.loop()


# start the application
if __name__ == '__main__':
    main()
