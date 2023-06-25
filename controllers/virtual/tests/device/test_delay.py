import pytest
from powerpi_common_test.device import DeviceTestBase

from macro_controller.device import DelayDevice


class TestDelayDevice(DeviceTestBase):
    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client
    ):
        return DelayDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            start=0.1,
            end=0.1,
            name='delay'
        )
