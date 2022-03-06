import pytest

from asyncio import Future
from pytest_mock import MockerFixture
from typing import List, Tuple
from unittest.mock import PropertyMock, patch

from powerpi_common.util import await_or_sync
from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase, PollableMixinTestBase
from macro_controller.device import CompositeDevice


class TestCompositeDevice(AdditionalStateDeviceTestBase, DeviceOrchestratorMixinTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()

        self.devices = { f'device{i}': mocker.Mock() for i in range(0, 4)}

        self.device_manager.get_device = lambda name: self.devices[name]

        future = Future()
        future.set_result(None)
        for device in self.devices.values():
            for method in ['turn_on', 'turn_off', 'change_power_and_additional_state']:
                mocker.patch.object(
                    device,
                    method,
                    return_value=future
                )

        return CompositeDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            self.devices.keys(),
            name='composite'
        )

    async def test_all_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_on()

        for device in self.devices.values():
            device.turn_on.assert_called_once()

    async def test_all_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_off()

        for device in self.devices.values():
            device.turn_off.assert_called_once()
    
    async def test_all_change_power_and_additional_state(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        new_state = 'on'
        new_additional_state = { 'something': 'else' }

        with patch('macro_controller.device.composite.ismixin') as ismixin:
            ismixin.return_value = True

            await subject.change_power_and_additional_state(new_state, new_additional_state)
        
        for device in self.devices.values():
            device.change_power_and_additional_state.assert_called_once_with(
                new_state, new_additional_state
            )
    
    async def test_all_change_power_and_additional_state_unsupported(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        new_state = 'on'
        new_additional_state = { 'something': 'else' }

        with patch('macro_controller.device.composite.ismixin') as ismixin:
            ismixin.return_value = False

            await subject.change_power_and_additional_state(new_state, new_additional_state)

        for device in self.devices.values():
            device.turn_on.assert_called_once()
    
    @pytest.mark.parametrize('states', [
        ('unknown', 'on', ['unknown', 'unknown', 'unknown', 'on']),
        ('unknown', 'off', ['unknown', 'unknown', 'unknown', 'off']),
        ('unknown', 'unknown', ['unknown', 'unknown', 'unknown', 'unknown']),
        ('on', 'on', ['on', 'on', 'on', 'on']),
        ('on', 'off', ['off', 'off', 'off', 'off']),
        ('on', 'unknown', ['unknown', 'unknown', 'unknown', 'unknown']),
        ('off', 'on', ['off', 'off', 'off', 'on']),
        ('off', 'off', ['off', 'off', 'off', 'off']),
        ('off', 'unknown', ['unknown', 'unknown', 'unknown', 'unknown'])
    ])
    def test_on_referenced_device_status(self, mocker: MockerFixture, states: Tuple[str, str, List[str]]):
        (initial_state, update_state, expected_states) = states

        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        
        # initialise the devices
        for device in self.devices.values():
            type(device).state = PropertyMock(return_value=initial_state)

        for device, expected in zip(self.devices.values(), expected_states):
            type(device).state = PropertyMock(return_value=update_state)
            subject.on_referenced_device_status(device.name, update_state)

            assert subject.state == expected

        assert subject.state == update_state
