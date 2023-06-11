import pytest
from powerpi_common_test.device import DeviceTestBase

from macro_controller.device import VariableDevice


class TestVariableDevice(DeviceTestBase):
    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client
    ):
        return VariableDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='variable'
        )
