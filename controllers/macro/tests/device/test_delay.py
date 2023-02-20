import pytest
from macro_controller.device import DelayDevice
from powerpi_common_test.device import DeviceTestBaseNew


class TestDelayDevice(DeviceTestBaseNew):
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
