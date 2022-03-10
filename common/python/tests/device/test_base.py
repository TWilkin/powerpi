from pytest_mock import MockerFixture

from powerpi_common_test.device.base import BaseDeviceTestBase
from powerpi_common.device.base import BaseDevice


class DeviceImpl(BaseDevice):
    pass


class TestBaseDevice(BaseDeviceTestBase):
    def create_subject(self, _: MockerFixture):
        self.display_name = getattr(self, 'display_name', None)

        return DeviceImpl('TestDevice', self.display_name)
    
    def test_name(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.name == 'TestDevice'
    
    def test_display_name(self, mocker: MockerFixture):
        self.display_name = 'Test Device'
        subject = self.create_subject(mocker)

        assert subject.display_name == 'Test Device'
    
    def test_no_display_name(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.display_name == 'TestDevice'
