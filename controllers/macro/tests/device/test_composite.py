from asyncio import Future
from typing import List, Tuple
from unittest.mock import PropertyMock, patch

import pytest

from pytest_mock import MockerFixture

from macro_controller.device import CompositeDevice
from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase, PollableMixinTestBase


class TestCompositeDevice(AdditionalStateDeviceTestBase, DeviceOrchestratorMixinTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()

        self.devices = {f'device{i}': mocker.Mock() for i in range(0, 4)}

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
            ['device0', 'device1', 'device2', 'device3'],
            name='composite', poll_frequency=60
        )

    async def test_all_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        # store the order they were called
        self.order = []

        def mock(name: str):
            async def turn_on():
                self.order.append(name)
            return turn_on

        for name, device in self.devices.items():
            device.turn_on = mock(name)

        await subject.turn_on()

        # ensure they were called in the correct order
        assert self.order == ['device0', 'device1', 'device2', 'device3']

    async def test_all_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        # store the order they were called
        self.order = []

        def mock(name: str):
            async def turn_off():
                self.order.append(name)
            return turn_off

        for name, device in self.devices.items():
            device.turn_off = mock(name)

        await subject.turn_off()

        # ensure they were called in the correct order
        assert self.order == ['device3', 'device2', 'device1', 'device0']

    @pytest.mark.parametrize('states', [
        ('on', ['device0', 'device1', 'device2', 'device3']),
        ('off', ['device3', 'device2', 'device1', 'device0'])
    ])
    async def test_all_change_power_and_additional_state(
        self,
        mocker: MockerFixture,
        states: Tuple[str, List[str]]
    ):
        (new_state, expected_order) = states

        subject = self.create_subject(mocker)

        # store the order they were called
        self.order = []

        def mock(name: str):
            async def change_power_and_additional_state(_: str, __: dict):
                self.order.append(name)
            return change_power_and_additional_state

        for name, device in self.devices.items():
            device.change_power_and_additional_state = mock(name)

        new_additional_state = {'something': 'else'}

        with patch('macro_controller.device.composite.ismixin') as ismixin:
            ismixin.return_value = True

            await subject.change_power_and_additional_state(new_state, new_additional_state)

        # ensure they were called in the correct order
        assert self.order == expected_order

    async def test_all_change_power_and_additional_state_unsupported(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        new_state = 'on'
        new_additional_state = {'something': 'else'}

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
    async def test_on_referenced_device_status(
        self,
        mocker: MockerFixture,
        states: Tuple[str, str, List[str]]
    ):
        (initial_state, update_state, expected_states) = states

        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'

        # initialise the devices
        for device in self.devices.values():
            type(device).state = PropertyMock(return_value=initial_state)

        for device, expected in zip(self.devices.values(), expected_states):
            type(device).state = PropertyMock(return_value=update_state)
            await subject.on_referenced_device_status(device.name, update_state)

            assert subject.state == expected

        assert subject.state == update_state
