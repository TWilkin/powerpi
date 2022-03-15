from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import InitialisableMixinTestBase


class DeviceImpl(Device, InitialisableMixin):
    def _turn_on(self):
        pass

    def _turn_off(self):
        pass

    async def initialise(self):
        pass


class TestInitialisableMixin(DeviceTestBase, InitialisableMixinTestBase):
    def get_subject(self, _: MockerFixture):
        return DeviceImpl(
            self.config, self.logger, self.mqtt_client,
            name='initialisable'
        )
