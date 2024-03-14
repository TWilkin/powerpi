from powerpi_common.device import DeviceStatus
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import DeviceVariable


def action_device_power(mqtt_client: MQTTClient, state: DeviceStatus):
    producer = mqtt_client.add_producer()

    def wrapper(device: DeviceVariable):
        producer(f'device/{device.name}/change', {'state': state})

    return wrapper
