from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from macro_controller.device import DelayDevice


class TestDelayDevice(DeviceTestBase):
    def get_subject(self, _: MockerFixture):
        return DelayDevice(
            self.config, self.logger, self.mqtt_client, 0.1, 0.1,
            name='delay'
        )
