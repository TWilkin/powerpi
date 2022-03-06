import pytest

from asyncio import Future
from pytest_mock import MockerFixture
from unittest.mock import PropertyMock, patch

from powerpi_common.device import Device
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

    @pytest.mark.parametrize('state', ['on', 'off', 'unknown'])
    async def test_poll(self, mocker: MockerFixture, state: str):
        subject = self.create_subject(mocker)

        device_state = PropertyMock(return_value=state)
        for device in self.devices.values():
            type(device).state = device_state

        assert subject.state == 'unknown'
        await subject.poll()
        assert subject.state == state

    @pytest.mark.parametrize('state', ['on', 'off', 'unknown'])
    async def test_on_referenced_device_status(self, mocker: MockerFixture, state: str):
        await self.test_poll(mocker, state)
