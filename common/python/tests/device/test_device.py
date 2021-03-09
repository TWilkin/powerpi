from pytest_mock import MockerFixture

from powerpi_common.device import Device
from .device import DeviceTestBase


class DeviceImpl(Device):
    def __init__(self, fixture):
        self.config = fixture.Mock()
        self.logger = fixture.Mock()
        self.mqtt_client = fixture.Mock()

        Device.__init__(
            self, self.config, self.logger, self.mqtt_client, 'test'
        )

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass


class TestDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        return DeviceImpl(mocker)
