from powerpi_common.device import DeviceStatus
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import DeviceVariable


def device_on_action(mqtt_client: MQTTClient):
    producer = mqtt_client.add_producer()

    def wrapper(device: DeviceVariable):
        producer(f'device/{device.name}/change', {'state': DeviceStatus.ON})

    return wrapper
