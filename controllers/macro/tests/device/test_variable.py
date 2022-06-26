from pytest_mock import MockerFixture

from macro_controller.device import VariableDevice
from powerpi_common_test.device import DeviceTestBase


class TestVariableDevice(DeviceTestBase):
    def get_subject(self, _: MockerFixture):
        self.message = 'test message'

        return VariableDevice(
            self.config, self.logger, self.mqtt_client,
            name='variable'
        )
