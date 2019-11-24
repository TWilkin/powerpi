import json
import paho.mqtt.client as mqtt
import os

# the MQTT topic we're reading/writing to
topic = 'home'

# change the power state of a device
def power(client, device, state):
    print('Turning device {:s} {:s}'.format(device, state))

    # now publish that the state was changed
    message = {
        'type': 'update',
        'device': device,
        'state': state
    }
    client.publish(topic, json.dumps(message))

# MQTT connect callback
def on_connect(client, user_data, flags, result_code):
    print('MQTT Connect {:d}'.format(result_code))
    client.subscribe(topic)

# MQTT message callback
def on_message(client, user_data, message):
    # read the JSON
    event = json.loads(message.payload)
    print(event)
    
    # check if we should respond to this message
    if event['type'] == 'power':
        if event['state'] != 'on' and event['state'] != 'off':
            print('Unrecognisable state {:s}'.format(event['state']))
            return
        
        # attempt to power the device on/off
        power(client, event['device'], event['state'])

# initialise and connect to MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(os.getenv('MQTT_HOST'), int(os.getenv('MQTT_PORT')), 60)

# loop while receiving messages
client.loop_forever()
