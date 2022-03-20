from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common.device.mixin import PollableMixin
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase


class DeviceImpl(Device, PollableMixin):
    async def poll(self):
        pass

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass


class TestPollableMixin(DeviceTestBase, PollableMixinTestBase):
    def get_subject(self, _: MockerFixture):
        return DeviceImpl(
            self.config, self.logger, self.mqtt_client,
            name='pollable'
        )
