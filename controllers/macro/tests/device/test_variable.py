import pytest
from macro_controller.device import VariableDevice
from powerpi_common_test.device import DeviceTestBaseNew


class TestVariableDevice(DeviceTestBaseNew):
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
