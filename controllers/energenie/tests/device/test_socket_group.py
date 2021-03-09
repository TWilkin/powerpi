from datetime import datetime

from pytest_mock import MockerFixture

from energenie_controller.device.socket import SocketGroupDevice
from .test_socket import TestSocketDevice as BaseTest


class SocketGroupDeviceImpl(SocketGroupDevice):
    def __init__(self, fixture):
        self.config = fixture.Mock()
        self.logger = fixture.Mock()
        self.mqtt_client = fixture.Mock()
        self.device_manager = fixture.Mock()

        SocketGroupDevice.__init__(
            self, self.config, self.logger, self.mqtt_client, self.device_manager, 'test', [
                'device1', 'device2']
        )


class TestSocketGroupDevice(BaseTest):
    def get_subject(self, mocker: MockerFixture):
        return SocketGroupDeviceImpl(mocker)

    def test_run_updates_devices(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        def func():
            pass

        device = self.get_subject(mocker)
        mocker.patch.object(
            subject.device_manager, 'get_device', return_value=device
        )

        assert device.state == 'unknown'

        subject._run(func, 'on')

        subject.device_manager.get_device.assert_has_calls(
            [mocker.call('device1'), mocker.call('device2')]
        )

        assert device.state == 'on'
