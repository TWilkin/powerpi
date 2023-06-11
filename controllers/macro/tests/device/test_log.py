import pytest
from powerpi_common_test.device import DeviceTestBase

from macro_controller.device import LogDevice


class TestLogDevice(DeviceTestBase):
    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client
    ):
        return LogDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='log',
            message='test message'
        )
