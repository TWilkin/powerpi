import pytest

from asyncio import Future
from pytest_mock import MockerFixture
from unittest.mock import PropertyMock, patch

from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase, PollableMixinTestBase
from macro_controller.device import CompositeDevice


class TestCompositeDevice(AdditionalStateDeviceTestBase, DeviceOrchestratorMixinTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()

        self.device = mocker.Mock()

        mocker.patch.object(
            self.device_manager, 'get_device', return_value=self.device
        )

        future = Future()
        future.set_result(None)
        for method in ['turn_on', 'turn_off', 'change_power_and_additional_state']:
            mocker.patch.object(
                self.device,
                method,
                return_value=future
            )

        return CompositeDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            ['device1', 'device2'],
            name='composite'
        )

    async def test_all_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_on()

        self.device.turn_on.assert_has_calls(
            [mocker.call(), mocker.call()]
        )

    async def test_all_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_off()

        self.device.turn_off.assert_has_calls(
            [mocker.call(), mocker.call()]
        )
    
    async def test_all_change_power_and_additional_state(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        new_state = 'on'
        new_additional_state = { 'something': 'else' }

        with patch('macro_controller.device.composite.ismixin') as ismixin:
            ismixin.return_value = True

            await subject.change_power_and_additional_state(new_state, new_additional_state)

        self.device.change_power_and_additional_state.assert_has_calls([
            mocker.call(new_state, new_additional_state),
            mocker.call(new_state, new_additional_state)
        ])
    
    async def test_all_change_power_and_additional_state_unsupported(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        new_state = 'on'
        new_additional_state = { 'something': 'else' }

        with patch('macro_controller.device.composite.ismixin') as ismixin:
            ismixin.return_value = False

            await subject.change_power_and_additional_state(new_state, new_additional_state)

        self.device.turn_on.assert_has_calls(
            [mocker.call(), mocker.call()]
        )

    @pytest.mark.parametrize('state', ['on', 'off', 'unknown'])
    async def test_poll(self, mocker: MockerFixture, state: str):
        subject = self.create_subject(mocker)

        self.device_state = PropertyMock(return_value=state)
        type(self.device).state = self.device_state

        assert subject.state == 'unknown'
        await subject.poll()
        assert subject.state == state
    
    @pytest.mark.parametrize('state', ['on', 'off', 'unknown'])
    def test_on_referenced_device_status(self, mocker: MockerFixture, state: str):
        subject = self.create_subject(mocker)

        self.device_state = PropertyMock(return_value=state)
        type(self.device).state = self.device_state

        assert subject.state == 'unknown'
        subject.on_referenced_device_status('test', state)
        assert subject.state == state
