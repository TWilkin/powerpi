from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common_test.device import DeviceTestBase
from lifx_controller.device.lifx_light import LIFXLightDevice


class TestLIFXLightDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.lifx_client = mocker.Mock()

        return LIFXLightDevice(
            self.config, self.logger, self.mqtt_client, self.lifx_client, 'test', '00:00:00:00:00', 'mylight.home'
        )
