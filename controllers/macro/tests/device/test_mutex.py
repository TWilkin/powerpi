from asyncio import Future
from typing import List, Tuple
from unittest.mock import PropertyMock

import pytest

from pytest_mock import MockerFixture

from macro_controller.device import MutexDevice
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase, PollableMixinTestBase


class TestMutexDevice(DeviceTestBase, DeviceOrchestratorMixinTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()

        self.devices = [mocker.Mock() for _ in range(4)]

        future = Future()
        future.set_result(None)
        for method in ['turn_on', 'turn_off']:
            for device in self.devices:
                mocker.patch.object(
                    device,
                    method,
                    return_value=future
                )

        def get_device(name: str):
            i = int(name)
            return self.devices[i]

        self.device_manager.get_device = get_device

        return MutexDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            off_devices=[0, 1],
            on_devices=[2, 3],
            name='mutex',
            poll_frequency=60
        )

    async def test_all_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_on()

        self.devices[0].turn_off.assert_called_once()
        self.devices[1].turn_off.assert_called_once()

        self.devices[2].turn_on.assert_called_once()
        self.devices[3].turn_on.assert_called_once()

    async def test_all_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_off()

        self.devices[0].turn_off.assert_called_once()
        self.devices[1].turn_off.assert_called_once()

        self.devices[2].turn_off.assert_called_once()
        self.devices[3].turn_off.assert_called_once()

    @pytest.mark.parametrize('states', [
        ('unknown', 'on', 'off', ['unknown', 'on'], ['unknown', 'unknown']),
        ('unknown', 'off', 'on', ['unknown', 'off'], ['unknown', 'unknown']),
        ('unknown', 'unknown', 'unknown', [
         'unknown', 'unknown'], ['unknown', 'unknown']),
        ('on', 'on', 'off', ['on', 'on'], ['off', 'on']),
        ('on', 'off', 'on', ['off', 'off'], ['off', 'off']),
        ('on', 'unknown', 'on', ['unknown', 'unknown'], ['off', 'off']),
        ('off', 'on', 'off', ['off', 'on'], ['off', 'off']),
        ('off', 'off', 'on', ['off', 'off'], ['off', 'off']),
        ('off', 'unknown', 'on', ['unknown', 'unknown'], ['off', 'off'])
    ])
    async def test_on_referenced_device_status(
        self,
        mocker: MockerFixture,
        states: Tuple[str, str, str, List[str]]
    ):
        (initial_state, on_update_state, off_update_state,
         expected_on_states, expected_off_states) = states

        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'

        # initialise the devices
        for device in self.devices:
            type(device).state = PropertyMock(return_value=initial_state)

        for device, expected in zip([self.devices[0], self.devices[1]], expected_off_states):
            type(device).state = PropertyMock(return_value=off_update_state)
            await subject.on_referenced_device_status(device.name, off_update_state)

            assert subject.state == expected

        for device, expected in zip([self.devices[2], self.devices[3]], expected_on_states):
            type(device).state = PropertyMock(return_value=on_update_state)
            await subject.on_referenced_device_status(device.name, on_update_state)

            assert subject.state == expected

        assert subject.state == on_update_state
