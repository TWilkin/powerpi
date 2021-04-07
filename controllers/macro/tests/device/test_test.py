from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from macro_controller.device import TestDevice


class TestTestDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.message = 'test message'

        return TestDevice(self.config, self.logger, self.mqtt_client, 'test', self.message)
