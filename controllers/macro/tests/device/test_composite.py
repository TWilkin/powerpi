import pytest

from asyncio import Future
from pytest_mock import MockerFixture
from unittest.mock import PropertyMock

from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from macro_controller.device import CompositeDevice


class TestCompositeDevice(DeviceTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()

        self.device = mocker.Mock()

        mocker.patch.object(
            self.device_manager, 'get_device', return_value=self.device
        )

        future = Future()
        future.set_result(None)
        for method in ['turn_on', 'turn_off']:
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

    @pytest.mark.parametrize('test_state', [('on'), ('off'), ('unknown')])
    async def test_poll(self, mocker: MockerFixture, test_state: str):
        subject = self.create_subject(mocker)

        self.device_state = PropertyMock(return_value=test_state)
        type(self.device).state = self.device_state

        assert subject.state == 'unknown'
        await subject.poll()
        assert subject.state == test_state
