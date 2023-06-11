import pytest
from powerpi_common_test.variable import VariableTestBase

from powerpi_common.variable.device import DeviceVariable


class TestDeviceVariable(VariableTestBase):

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return DeviceVariable(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            name='TestVariable'
        )
