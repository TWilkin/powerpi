from copy import deepcopy
from typing import Any

from jsonpatch import JsonPatch
from powerpi_common.condition import ConditionParser
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from powerpi_common.variable import DeviceVariable, VariableManager


def action_device_additional_state(
    mqtt_client: MQTTClient,
    variable_manager: VariableManager,
    scene: str | None,
    patch: dict[str, Any]
):
    producer = mqtt_client.add_producer()

    json_patch = JsonPatch(patch)

    def wrapper(device: DeviceVariable, message: MQTTMessage):
        current_state = device.additional_state

        parser = ConditionParser(variable_manager, message)

        # interpret any variables/operations in the values to patch
        patch = deepcopy(json_patch)
        for operation in patch:
            operation['value'] = parser.conditional_expression(
                operation['value']
            )

        patched = patch.apply(current_state)

        outgoing = {**patched}
        if scene:
            outgoing['scene'] = scene

        producer(f'device/{device.name}/change', outgoing)

    return wrapper
