from typing import Any, Dict

from jsonpatch import JsonPatch
from powerpi_common.condition import ConditionParser
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import DeviceVariable, VariableManager


def action_device_additional_state(
    mqtt_client: MQTTClient,
    variable_manager: VariableManager,
    scene: str | None,
    patch: Dict[str, Any]
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
