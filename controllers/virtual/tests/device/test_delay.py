import pytest
from powerpi_common_test.device import DeviceTestBase

from virtual_controller.device import DelayDevice


class TestDelayDevice(DeviceTestBase):
    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_variable_manager
    ):
        return DelayDevice(
            config=powerpi_config,
            logger=powerpi_logger,
            mqtt_client=powerpi_mqtt_client,
            variable_manager=powerpi_variable_manager,
            start=0.1,
            end=0.1,
            name='delay'
        )
