from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from macro_controller.device import LogDevice


class TestLogDevice(DeviceTestBase):
    def get_subject(self, _: MockerFixture):
        self.message = 'test message'

        return LogDevice(
            self.config, self.logger, self.mqtt_client, self.message,
            name='log'
        )
