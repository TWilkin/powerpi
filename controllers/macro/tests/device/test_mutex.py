import pytest

from pytest_mock import MockerFixture
from unittest.mock import PropertyMock

from powerpi_common_test.device import DeviceTestBase
from macro_controller.device import MutexDevice


class TestMutexDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()

        devices = [mocker.Mock() for _ in range(4)]
        self.devices = devices

        def get_device(name: str):
            i = int(name)
            return devices[i]

        self.device_manager.get_device = get_device

        return MutexDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, 'composite',
            off_devices=[0, 1],
            on_devices=[2, 3]
        )

    def test_all_on(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.turn_on()

        self.devices[0].turn_off.assert_called_once()
        self.devices[1].turn_off.assert_called_once()

        self.devices[2].turn_on.assert_called_once()
        self.devices[3].turn_on.assert_called_once()

    def test_all_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.turn_off()

        self.devices[0].turn_off.assert_called_once()
        self.devices[1].turn_off.assert_called_once()

        self.devices[2].turn_off.assert_called_once()
        self.devices[3].turn_off.assert_called_once()

    @pytest.mark.parametrize('test_state', [('on'), ('off'), ('unknown')])
    def test_poll(self, mocker: MockerFixture, test_state: str):
        subject = self.get_subject(mocker)

        for device in self.devices[:2]:
            type(device).state = PropertyMock(return_value='off')
        for device in self.devices[2:]:
            type(device).state = PropertyMock(return_value=test_state)

        assert subject.state == 'unknown'
        subject.poll()
        assert subject.state == test_state
