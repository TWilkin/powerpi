from asyncio import Future
from typing import Dict, List
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import (DeviceOrchestratorMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture

from macro_controller.device import CompositeDevice


class TestCompositeDevice(
    AdditionalStateDeviceTestBase,
    DeviceOrchestratorMixinTestBase,
    PollableMixinTestBase
):

    @pytest.mark.asyncio
    async def test_all_on(
        self,
        subject: CompositeDevice,
        devices: Dict[str, MagicMock]
    ):
        # store the order they were called
        order = []

        def mock(name: str):
            async def turn_on():
                order.append(name)
            return turn_on

        for name, device in devices.items():
            device.turn_on = mock(name)

        await subject.turn_on()

        # ensure they were called in the correct order
        assert order == ['device0', 'device1', 'device2', 'device3']

    @pytest.mark.asyncio
    async def test_all_off(
        self,
        subject: CompositeDevice,
        devices: Dict[str, MagicMock]
    ):
        # store the order they were called
        order = []

        def mock(name: str):
            async def turn_off():
                order.append(name)
            return turn_off

        for name, device in devices.items():
            device.turn_off = mock(name)

        await subject.turn_off()

        # ensure they were called in the correct order
        assert order == ['device3', 'device2', 'device1', 'device0']

    @pytest.mark.asyncio
    @pytest.mark.parametrize('new_state,expected_order', [
        ('on', ['device0', 'device1', 'device2', 'device3']),
        ('off', ['device3', 'device2', 'device1', 'device0'])
    ])
    async def test_all_change_power_and_additional_state(
        self,
        subject: CompositeDevice,
        devices: Dict[str, MagicMock],
        new_state: str,
        expected_order: List[str]
    ):
        # store the order they were called
        order = []

        def mock(name: str):
            async def change_power_and_additional_state(_: str, __: str, ___: dict):
                order.append(name)
            return change_power_and_additional_state

        for name, device in devices.items():
            device.change_power_and_additional_state = mock(name)

        new_additional_state = {'something': 'else'}

        with patch('macro_controller.device.composite.ismixin') as ismixin:
            ismixin.return_value = True

            await subject.change_power_and_additional_state(
                new_state=new_state,
                new_additional_state=new_additional_state
            )

        # ensure they were called in the correct order
        assert order == expected_order

    @pytest.mark.asyncio
    async def test_all_change_power_and_additional_state_unsupported(
        self,
        subject: CompositeDevice,
        devices: Dict[str, MagicMock]
    ):
        new_state = 'on'
        new_additional_state = {'something': 'else'}

        with patch('macro_controller.device.composite.ismixin') as ismixin:
            ismixin.return_value = False

            await subject.change_power_and_additional_state(
                new_state=new_state,
                new_additional_state=new_additional_state
            )

        for device in devices.values():
            device.turn_on.assert_called_once()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('initial_state,update_state,expected_states', [
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
        subject: CompositeDevice,
        devices: Dict[str, MagicMock],
        initial_state: str,
        update_state: str,
        expected_states: List[str]
    ):
        # pylint: disable=too-many-arguments

        assert subject.state == 'unknown'

        # initialise the devices
        for device in devices.values():
            type(device).state = PropertyMock(return_value=initial_state)

        for device, expected in zip(devices.values(), expected_states):
            type(device).state = PropertyMock(return_value=update_state)
            await subject.on_referenced_device_status(device.name, update_state)

            assert subject.state == expected

        assert subject.state == update_state

    @pytest.mark.asyncio
    async def test_scene_event_message(self, subject: CompositeDevice):
        scene_event_consumer = self._mqtt_consumers['scene']

        message = {
            'scene': 'other'
        }

        assert subject.scene == 'default'
        assert subject.state == 'unknown'

        # should change the scene
        await scene_event_consumer.on_message(message, subject.name, 'scene')
        assert subject.scene == 'other'

        # additional state will always be applied to the composite regardless of scene

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        device_manager
    ):
        return CompositeDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, device_manager,
            devices=['device0', 'device1', 'device2', 'device3'],
            name='composite',
            poll_frequency=60
        )

    @pytest.fixture
    def devices(self, mocker: MockerFixture):
        devices = {f'device{i}': mocker.Mock() for i in range(0, 4)}

        future = Future()
        future.set_result(True)
        for method in ['turn_on', 'turn_off', 'change_power_and_additional_state']:
            for device in devices.values():
                mocker.patch.object(
                    device,
                    method,
                    return_value=future
                )

        return devices

    @pytest.fixture
    def device_manager(self, devices: Dict[str, MagicMock], mocker: MockerFixture):
        manager = mocker.MagicMock()

        manager.get_device = lambda name: devices[name]

        return manager
