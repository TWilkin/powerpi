from power_starter.devices import DeviceManager
from power_starter.events import EventManager
from power_starter.mqtt import MQTTClient, PowerEventConsumer
from power_starter.status import StatusChecker
from power_starter.util.config import Config
from power_starter.util.logger import Logger


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
    status_checker = StatusChecker(config)
    status_checker.schedule()
    status_checker.loop_start()

    # loop while receiving messages
    client.loop()


# start the application
if __name__ == '__main__':
    main()
