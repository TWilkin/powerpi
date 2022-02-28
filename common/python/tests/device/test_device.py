from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common_test.device import DeviceTestBase


class DeviceImpl(Device):
    def __init__(self, config, logger, mqtt_client):
        Device.__init__(
            self, config, logger, mqtt_client, 
            name='test'
        )

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass


class TestDevice(DeviceTestBase):
    def get_subject(self, _: MockerFixture):
        return DeviceImpl(self.config, self.logger, self.mqtt_client)
