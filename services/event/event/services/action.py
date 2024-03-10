from typing import Any, Dict

from jsonpatch import JsonPatch
from powerpi_common.condition import ConditionParser
from powerpi_common.device import DeviceStatus
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import DeviceVariable, VariableManager


def device_on_action(mqtt_client: MQTTClient):
    producer = mqtt_client.add_producer()

    def wrapper(device: DeviceVariable):
        producer(f'device/{device.name}/change', {'status': DeviceStatus.ON})

    return wrapper


def device_off_action(mqtt_client: MQTTClient):
    producer = mqtt_client.add_producer()

    def wrapper(device: DeviceVariable):
        producer(f'device/{device.name}/change', {'status': DeviceStatus.OFF})

    return wrapper


def device_additional_state_action(
    scene: str | None,
    patch: Dict[str, Any],
    mqtt_client: MQTTClient,
    variable_manager: VariableManager
):
    producer = mqtt_client.add_producer()

    json_patch = JsonPatch(patch)

    def wrapper(device: DeviceVariable):
        current_state = device.additional_state

        parser = ConditionParser(variable_manager)

        # interpret any variables in the values to patch
        for operation in json_patch:
            operation['value'] = parser.conditional_expression(
                operation['value']
            )

        patched = json_patch.apply(current_state)

        message = {**patched}
        if scene:
            message['scene'] = scene

        producer(f'device/{device.name}/change', message)

    return wrapper


def device_scene_action(scene: str | None, mqtt_client: MQTTClient):
    producer = mqtt_client.add_producer()

    def wrapper(device: DeviceVariable):
        producer(f'device/{device.name}/scene', {scene})
        device.change_scene(scene)

    return wrapper
