from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import DeviceVariable


def device_scene_action(mqtt_client: MQTTClient, scene: str | None):
    producer = mqtt_client.add_producer()

    def wrapper(device: DeviceVariable):
        producer(f'device/{device.name}/scene', {'scene': scene})

    return wrapper
