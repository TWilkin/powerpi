import json
import os
from urllib.parse import urlparse

import paho.mqtt.client as mqtt

from power_starter.devices import DeviceManager
from power_starter.util.logger import Logger


# the MQTT topic we're reading/writing to
topic = 'home'

# change the power state of a device
def power(client, device_name, state):
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
        Logger.error(e)
        return

    # now publish that the state was changed
    message = {
        'type': 'update',
        'device': device_name,
        'state': state
    }
    client.publish(topic, json.dumps(message))

# MQTT connect callback
def on_connect(client, user_data, flags, result_code):
    Logger.info('MQTT Connect {:d}'.format(result_code))
    client.subscribe(topic)

# MQTT message callback
def on_message(client, user_data, message):
    # read the JSON
    event = json.loads(message.payload)
    Logger.info('Received: {:s}'.format(json.dumps(event)))
    
    # check if we should respond to this message
    if event['type'] == 'power':
        if event['state'] != 'on' and event['state'] != 'off':
            Logger.error('Unrecognisable state {:s}'.format(event['state']))
            return
        if event['device'] is None or event['device'].strip() == '':
            Logger.error('Device is a required field')
            return
        
        # attempt to power the device on/off
        power(client, event['device'], event['state'])

# main entry point for the application
def main():
    # initialise the logger
    Logger.initialise()

    # initialise the DeviceManager
    DeviceManager.load([
        {'type': 'socket', 'name': 'CabinetLight', 'home_id': 4}
    ])

    # initialise and connect to MQTT
    mqtt_url = urlparse(os.getenv('MQTT_ADDRESS'))
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(mqtt_url.hostname, mqtt_url.port, 60)

    # loop while receiving messages
    client.loop_forever()

# start the application
if __name__ == '__main__':
    main()
