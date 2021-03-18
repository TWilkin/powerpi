from datetime import datetime

from pytest_mock import MockerFixture

from powerpi_common.device import Device
from energenie_controller.device.socket_group import SocketGroupDevice
from .test_socket import TestSocketDevice as BaseTest


class TestSocketGroupDevice(BaseTest):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.energenie = mocker.Mock()

        self.socket = Device(
            self.config, self.logger, self.mqtt_client, 'socket'
        )
        mocker.patch.object(
            self.device_manager, 'get_device', return_value=self.socket
        )

        self.devices = ['device1', 'device2']

        return SocketGroupDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            self.energenie, 'test', self.devices, retries=2, delay=0
        )

    def test_run_updates_devices(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        def func():
            pass

        assert self.socket.state == 'unknown'

        subject._run(func, 'on')

        self.device_manager.get_device.assert_has_calls([
            mocker.call(self.devices[0]),
            mocker.call(self.devices[1])
        ])

        assert self.socket.state == 'on'
