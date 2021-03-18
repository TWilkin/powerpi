from datetime import datetime

from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from energenie_controller.device.socket import SocketDevice


class SocketDeviceImpl(SocketDevice):
    def __init__(self, config, logger, mqtt_client):
        SocketDevice.__init__(
            self, config, logger, mqtt_client, 'test'
        )


class TestSocketDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        return SocketDeviceImpl(self.config, self.logger, self.mqtt_client)

    def test_run(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.counter = 0

        def func(a, b):
            self.counter += 1
            assert a == 1
            assert b == 2

        subject._run(func, 'blah', 1, 2)

        assert self.counter == 4
