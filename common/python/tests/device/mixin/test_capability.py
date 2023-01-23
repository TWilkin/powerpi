import pytest
from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.device.mixin import CapabilityMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common_test.device.mixin import CapabilityMixinTestBase


class DeviceImpl(Device, CapabilityMixin):
    # pylint: disable=too-many-ancestors
    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass


class TestCapabilityMixin(CapabilityMixinTestBase):
    @pytest.fixture
    def subject(
        self,
        powerpi_config: Config,
        powerpi_logger: Logger,
        powerpi_mqtt_client: MQTTClient
    ):
        return DeviceImpl(powerpi_config, powerpi_logger, powerpi_mqtt_client, name='Capability')
