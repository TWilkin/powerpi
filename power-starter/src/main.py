import paho.mqtt.client as mqtt
import os

# MQTT connect callback
def on_connect(client, user_data, flags, result_code):
    print('MQTT Connect {:d}'.format(result_code))
    client.subscribe('home')

# MQTT message callback
def on_message(client, user_data, message):
    print('{:s} {:s}'.format(message.topic, str(message.payload)))

# initialise and connect to MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(os.getenv('MQTT_HOST'), int(os.getenv('MQTT_PORT')), 60)

# loop while receiving messages
client.loop_forever()
