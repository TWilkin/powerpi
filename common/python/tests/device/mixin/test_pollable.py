from pytest_mock import MockerFixture

from powerpi_common.device.mixin import PollableMixin
from powerpi_common_test.device.mixin import PollableMixinTestBase


class DeviceImpl(PollableMixin):    
    def _poll(self):
        pass


class TestPollableMixin(PollableMixinTestBase):
    def get_subject(self, _: MockerFixture):
        return DeviceImpl()
