from typing import Any, Dict

from jsonpatch import JsonPatch

from powerpi_common.condition import ConditionParser
from powerpi_common.device import AdditionalStateDevice, Device
from powerpi_common.variable import VariableManager


async def device_on_action(device: Device):
    await device.turn_on()


async def device_off_action(device: Device):
    await device.turn_off()


def device_additional_state_action(
    scene: str | None,
    patch: Dict[str, Any],
    variable_manager: VariableManager
):
    json_patch = JsonPatch(patch)

    async def wrapper(device: AdditionalStateDevice):
        current_state = device.additional_state

        parser = ConditionParser(variable_manager)

        # interpret any variables in the values to patch
        for operation in json_patch:
            operation['value'] = parser.conditional_expression(
                operation['value']
            )

        patched = json_patch.apply(current_state)

        await device.change_power_and_additional_state(
            scene=scene,
            new_additional_state=patched
        )

    return wrapper


def device_scene_action(scene: str | None):
    async def wrapper(device: AdditionalStateDevice):
        await device.change_scene(scene)

    return wrapper
