from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from macro_controller.device import LogDevice


class TestLogDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.message = 'test message'

        return LogDevice(
            self.config, self.logger, self.mqtt_client, self.message,
            name='log'
        )
