import pytest
from powerpi_common_test.variable import VariableTestBaseNew

from powerpi_common.variable.device import DeviceVariable


class TestDeviceVariable(VariableTestBaseNew):

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return DeviceVariable(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            name='TestVariable'
        )
