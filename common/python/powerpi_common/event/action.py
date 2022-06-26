from jsonpatch import JsonPatch

from powerpi_common.device import Device


async def device_on_action(device: Device):
    await device.turn_on()


async def device_off_action(device: Device):
    await device.turn_off()


def device_additional_state_action(patch: dict):
    patch = JsonPatch(patch)

    async def wrapper(device: Device):
        current_state = device.additional_state

        patched = patch.apply(current_state)
        await device.change_power_and_additional_state(None, patched)

    return wrapper
