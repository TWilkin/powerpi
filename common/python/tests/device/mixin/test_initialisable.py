import pytest
from powerpi_common_test.device import DeviceTestBaseNew
from powerpi_common_test.device.mixin import InitialisableMixinTestBaseNew

from powerpi_common.device import Device
from powerpi_common.device.mixin import InitialisableMixin


class DeviceImpl(Device, InitialisableMixin):
    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass

    async def initialise(self):
        pass


class TestInitialisableMixin(DeviceTestBaseNew, InitialisableMixinTestBaseNew):

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return DeviceImpl(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='initialisable'
        )
