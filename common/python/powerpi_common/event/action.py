from jsonpatch import JsonPatch

from powerpi_common.condition import ConditionParser
from powerpi_common.device import Device
from powerpi_common.variable import VariableManager


async def device_on_action(device: Device):
    await device.turn_on()


async def device_off_action(device: Device):
    await device.turn_off()


def device_additional_state_action(patch: dict, variable_manager: VariableManager):
    patch = JsonPatch(patch)

    async def wrapper(device: Device):
        current_state = device.additional_state

        parser = ConditionParser(variable_manager)

        # interpret any variables in the values to patch
        for operation in patch:
            operation['value'] = parser.conditional_expression(
                operation['value']
            )

        patched = patch.apply(current_state)
        await device.change_power_and_additional_state(None, patched)

    return wrapper
