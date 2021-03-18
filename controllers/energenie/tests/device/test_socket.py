from datetime import datetime

from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from energenie_controller.device.socket import SocketDevice


class TestSocketDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.energenie = mocker.Mock()

        return SocketDevice(
            self.config, self.logger, self.mqtt_client,
            self.energenie, 'test', retries=2, delay=0
        )

    def test_run(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.counter = 0

        def func():
            self.counter += 1

        subject._run(func)

        assert self.counter == 2
