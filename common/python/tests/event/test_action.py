import pytest
from pytest_mock import MockerFixture

from powerpi_common.event.action import device_additional_state_action, device_off_action, \
    device_on_action

pytestmark = pytest.mark.asyncio


class DeviceImpl:
    def __init__(self):
        self.state = None
        self.additional_state = {
            'brightness': None,
            'other': 'untouched'
        }

    async def turn_on(self):
        self.state = 'on'

    async def turn_off(self):
        self.state = 'off'

    async def change_power_and_additional_state(self, _, new_additional_state: dict):
        self.additional_state = new_additional_state


async def test_device_on_action():
    device = DeviceImpl()

    assert device.state is None

    await device_on_action(device)

    assert device.state == 'on'


async def test_device_off_action():
    device = DeviceImpl()

    assert device.state is None

    await device_off_action(device)

    assert device.state == 'off'


async def test_device_additional_state_action(mocker: MockerFixture):
    variable_manager = mocker.Mock()

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

    func = device_additional_state_action(patch, variable_manager)

    assert device.additional_state['brightness'] is None
    assert device.additional_state['other'] == 'untouched'

    await func(device)

    assert device.additional_state['brightness'] == 5000
    assert device.additional_state['something'] == 'boom'
    assert device.additional_state['other'] == 'untouched'


async def test_device_additional_state_action_with_variable(mocker: MockerFixture):
    variable_manager = mocker.Mock()

    device = DeviceImpl()

    variable_manager.get_device = lambda _: device

    patch = [
        {
            'op': 'replace',
            'path': '/brightness',
            'value': 'var.device.Light.other'
        },
    ]

    func = device_additional_state_action(patch, variable_manager)

    assert device.additional_state['brightness'] is None
    assert device.additional_state['other'] == 'untouched'

    await func(device)

    assert device.additional_state['brightness'] == 'untouched'
    assert device.additional_state['other'] == 'untouched'