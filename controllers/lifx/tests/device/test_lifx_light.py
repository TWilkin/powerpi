from pytest_mock import MockerFixture

from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from lifx_controller.device.lifx_light import LIFXLightDevice


class TestLIFXLightDevice(AdditionalStateDeviceTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.lifx_client = mocker.Mock()

        return LIFXLightDevice(
            self.config, self.logger, self.mqtt_client, self.lifx_client, '00:00:00:00:00', 'mylight.home',
            name='light'
        )
