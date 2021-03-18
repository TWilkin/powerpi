from datetime import datetime

from pytest_mock import MockerFixture

from powerpi_common.device import Device
from energenie_controller.device.socket import SocketGroupDevice
from .test_socket import TestSocketDevice as BaseTest


class SocketGroupDeviceImpl(SocketGroupDevice):
    def __init__(self, config, logger, mqtt_client, device_manager):
        SocketGroupDevice.__init__(
            self, config, logger, mqtt_client, device_manager, 'test', [
                'device1', 'device2']
        )


class TestSocketGroupDevice(BaseTest):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()

        self.socket = Device(
            self.config, self.logger, self.mqtt_client, 'socket'
        )
        mocker.patch.object(
            self.device_manager, 'get_device', return_value=self.socket
        )

        return SocketGroupDeviceImpl(self.config, self.logger, self.mqtt_client, self.device_manager)

    def test_run_updates_devices(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        def func():
            pass

        assert self.socket.state == 'unknown'

        subject._run(func, 'on')

        self.device_manager.get_device.assert_has_calls(
            [mocker.call('device1'), mocker.call('device2')]
        )

        assert self.socket.state == 'on'
