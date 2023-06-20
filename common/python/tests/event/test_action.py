from typing import Optional

import pytest

from powerpi_common.device.mixin import AdditionalState
from powerpi_common.device.scene_state import ReservedScenes
from powerpi_common.event.action import (device_additional_state_action,
                                         device_off_action, device_on_action)


class DeviceImpl:
    def __init__(self):
        self.scene = ReservedScenes.DEFAULT
        self.state = None
        self.additional_state = {
            'brightness': None,
            'other': 'untouched'
        }

    async def turn_on(self):
        self.state = 'on'

    async def turn_off(self):
        self.state = 'off'

    async def change_power_and_additional_state(
        self,
        scene: Optional[str] = None,
        _: Optional[str] = None,
        new_additional_state: Optional[AdditionalState] = None
    ):
        self.scene = scene
        self.additional_state = new_additional_state


@pytest.mark.asyncio
async def test_device_on_action():
    device = DeviceImpl()

    assert device.state is None

    await device_on_action(device)

    assert device.state == 'on'


@pytest.mark.asyncio
async def test_device_off_action():
    device = DeviceImpl()

    assert device.state is None

    await device_off_action(device)

    assert device.state == 'off'


@pytest.mark.asyncio
@pytest.mark.parametrize('scene', [None, 'default', 'other'])
async def test_device_additional_state_action(powerpi_variable_manager, scene: Optional[str]):
    device = DeviceImpl()

    patch = [
        {
            'op': 'replace',
            'path': '/brightness',
            'value': 5000
        },
        {
            'op': 'add',
            'path': '/something',
            'value': 'boom'
        }
    ]

    func = device_additional_state_action(
        scene, patch, powerpi_variable_manager
    )

    assert device.scene == ReservedScenes.DEFAULT
    assert device.additional_state['brightness'] is None
    assert device.additional_state['other'] == 'untouched'

    await func(device)

    assert device.scene == scene
    assert device.additional_state['brightness'] == 5000
    assert device.additional_state['something'] == 'boom'
    assert device.additional_state['other'] == 'untouched'


@pytest.mark.asyncio
async def test_device_additional_state_action_with_variable(powerpi_variable_manager):
    device = DeviceImpl()

    powerpi_variable_manager.get_device = lambda _: device

    patch = [
        {
            'op': 'replace',
            'path': '/brightness',
            'value': {'var': 'device.Light.other'}
        },
    ]

    func = device_additional_state_action(
        None, patch, powerpi_variable_manager
    )

    assert device.additional_state['brightness'] is None
    assert device.additional_state['other'] == 'untouched'

    await func(device)

    assert device.additional_state['brightness'] == 'untouched'
    assert device.additional_state['other'] == 'untouched'
