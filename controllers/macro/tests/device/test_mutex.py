from asyncio import Future
from typing import List, Tuple
from unittest.mock import MagicMock, PropertyMock

import pytest
from macro_controller.device import MutexDevice
from powerpi_common_test.device import DeviceTestBaseNew
from powerpi_common_test.device.mixin import (
    DeviceOrchestratorMixinTestBaseNew, PollableMixinTestBaseNew)
from pytest_mock import MockerFixture


class TestMutexDevice(
    DeviceTestBaseNew,
    DeviceOrchestratorMixinTestBaseNew,
    PollableMixinTestBaseNew
):
    @pytest.mark.asyncio
    async def test_all_on(self, subject: MutexDevice, devices: List[MagicMock]):
        await subject.turn_on()

        devices[0].turn_off.assert_called_once()
        devices[1].turn_off.assert_called_once()

        devices[2].turn_on.assert_called_once()
        devices[3].turn_on.assert_called_once()

    @pytest.mark.asyncio
    async def test_all_off(self, subject: MutexDevice, devices: List[MagicMock]):
        await subject.turn_off()

        devices[0].turn_off.assert_called_once()
        devices[1].turn_off.assert_called_once()

        devices[2].turn_off.assert_called_once()
        devices[3].turn_off.assert_called_once()

    @pytest.mark.asyncio
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
        subject: MutexDevice,
        devices: List[MagicMock],
        states: Tuple[str, str, str, List[str]]
    ):
        (initial_state, on_update_state, off_update_state,
         expected_on_states, expected_off_states) = states

        assert subject.state == 'unknown'

        # initialise the devices
        for device in devices:
            type(device).state = PropertyMock(return_value=initial_state)

        for device, expected in zip([devices[0], devices[1]], expected_off_states):
            type(device).state = PropertyMock(return_value=off_update_state)
            await subject.on_referenced_device_status(device.name, off_update_state)

            assert subject.state == expected

        for device, expected in zip([devices[2], devices[3]], expected_on_states):
            type(device).state = PropertyMock(return_value=on_update_state)
            await subject.on_referenced_device_status(device.name, on_update_state)

            assert subject.state == expected

        assert subject.state == on_update_state

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        device_manager
    ):
        return MutexDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, device_manager,
            off_devices=[0, 1],
            on_devices=[2, 3],
            name='mutex',
            poll_frequency=60
        )

    @pytest.fixture
    def devices(self, mocker: MockerFixture):
        devices = [mocker.MagicMock() for _ in range(4)]

        future = Future()
        future.set_result(True)
        for method in ['turn_on', 'turn_off']:
            for device in devices:
                mocker.patch.object(
                    device,
                    method,
                    return_value=future
                )

        return devices

    @pytest.fixture
    def device_manager(self, devices: List[MagicMock], mocker: MockerFixture):
        manager = mocker.MagicMock()

        def get_device(name: str):
            i = int(name)
            return devices[i]

        manager.get_device = get_device

        return manager
