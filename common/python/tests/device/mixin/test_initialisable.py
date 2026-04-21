import pytest
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import InitialisableMixinTestBase

from powerpi_common.device import Device
from powerpi_common.device.mixin import InitialisableMixin


class DeviceImpl(Device, InitialisableMixin):
    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass

    async def initialise(self):
        pass


class TestInitialisableMixin(DeviceTestBase, InitialisableMixinTestBase):

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_variable_manager
    ):
        return DeviceImpl(
            config=powerpi_config,
            logger=powerpi_logger,
            mqtt_client=powerpi_mqtt_client,
            variable_manager=powerpi_variable_manager,
            name='initialisable'
        )
