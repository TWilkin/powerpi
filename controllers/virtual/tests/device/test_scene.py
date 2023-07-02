from asyncio import Future
from typing import Dict, List
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from powerpi_common.device import DeviceStatus
from powerpi_common.device.scene_state import ReservedScenes
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import (DeviceOrchestratorMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture

from virtual_controller.device.scene import SceneDevice

DeviceList = Dict[str, MagicMock]


class TestSceneDevice(
    DeviceTestBase,
    DeviceOrchestratorMixinTestBase,
    PollableMixinTestBase
):

    @pytest.mark.asyncio
    async def test_turn_on_all_change_scene(self, subject: SceneDevice, devices: DeviceList):
        assert subject.state == DeviceStatus.UNKNOWN

        with patch('virtual_controller.device.scene.ismixin') as ismixin:
            ismixin.return_value = True

            await subject.turn_on()

        assert subject.state == DeviceStatus.ON

        for device in devices.values():
            device.change_power_and_additional_state.assert_called_once_with(
                scene='movie',
                new_additional_state={'brightness': 10, 'temperature': 4000}
            )

            device.change_scene.assert_called_once_with('movie')

    @pytest.mark.asyncio
    async def test_turn_off_all_change_scene(self, subject: SceneDevice, devices: DeviceList):
        assert subject.state == DeviceStatus.UNKNOWN

        with patch('virtual_controller.device.scene.ismixin') as ismixin:
            ismixin.return_value = True

            await subject.turn_off()

        assert subject.state == DeviceStatus.OFF

        for device in devices.values():
            device.change_power_and_additional_state.assert_not_called()

            device.change_scene.assert_called_once_with(ReservedScenes.DEFAULT)

    @pytest.mark.asyncio
    async def test_turn_on_unsupported_device(self, subject: SceneDevice, devices: DeviceList):
        assert subject.state == DeviceStatus.UNKNOWN

        with patch('virtual_controller.device.scene.ismixin') as ismixin:
            ismixin.return_value = False

            await subject.turn_on()

        assert subject.state == DeviceStatus.ON

        for device in devices.values():
            device.change_power_and_additional_state.assert_not_called()

            device.change_scene.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('initial_scene,update_scene,expected_states', [
        ('default', 'default', ['off', 'off']),
        ('default', 'movie', ['off', 'on']),
        ('default', 'other', ['off', 'off']),
        ('movie', 'movie', ['on', 'on']),
        ('movie', 'default', ['off', 'off'])
    ])
    async def test_on_referenced_device_status(
        self,
        subject: SceneDevice,
        devices: DeviceList,
        initial_scene: str,
        update_scene: str,
        expected_states: List[str]
    ):
        # pylint: disable=too-many-arguments
        assert subject.state == DeviceStatus.UNKNOWN

        with patch('virtual_controller.device.scene.ismixin') as ismixin:
            ismixin.return_value = True

            # initialise the devices
            for device in devices.values():
                type(device).scene = PropertyMock(return_value=initial_scene)

            for device, expected in zip(devices.values(), expected_states):
                type(device).scene = PropertyMock(return_value=update_scene)
                await subject.on_referenced_device_status(device.name, 'on')

                assert subject.state == expected

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        device_manager
    ):
        return SceneDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            device_manager,
            name='Scene',
            poll_frequency=60,
            devices=['device0', 'device1'],
            scene='movie',
            state={'brightness': 10, 'temperature': 4000}
        )

    @pytest.fixture
    def devices(self, mocker: MockerFixture):
        devices = {f'device{i}': mocker.MagicMock() for i in range(0, 2)}

        future = Future()
        future.set_result(True)
        for method in ['change_power_and_additional_state', 'change_scene']:
            for device in devices.values():
                mocker.patch.object(
                    device, method, return_value=future
                )

        return devices

    @pytest.fixture
    def device_manager(self, devices: DeviceList, powerpi_device_manager):
        powerpi_device_manager.get_device = lambda name: devices[name]

        return powerpi_device_manager
