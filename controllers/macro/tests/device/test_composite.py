import pytest

from pytest_mock import MockerFixture
from unittest.mock import PropertyMock

from powerpi_common_test.device import DeviceTestBase
from macro_controller.device import CompositeDevice


class TestCompositeDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()

        self.device = mocker.Mock()
        mocker.patch.object(
            self.device_manager, 'get_device', return_value=self.device
        )

        return CompositeDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, 'composite',
            ['device1', 'device2']
        )

    def test_all_on(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.turn_on()

        self.device.turn_on.assert_has_calls(
            [mocker.call(), mocker.call()]
        )

    def test_all_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.turn_off()

        self.device.turn_off.assert_has_calls(
            [mocker.call(), mocker.call()]
        )

    @pytest.mark.parametrize('test_state', [('on'), ('off'), ('unknown')])
    def test_poll(self, mocker: MockerFixture, test_state: str):
        subject = self.get_subject(mocker)

        self.device_state = PropertyMock(return_value=test_state)
        type(self.device).state = self.device_state

        assert subject.state == 'unknown'
        subject.poll()
        assert subject.state == test_state
