from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common_test.device import DeviceTestBase


class DeviceImpl(Device):
    def __init__(self, config, logger, mqtt_client):
        Device.__init__(
            self, config, logger, mqtt_client, 'test'
        )
    
    def poll(self):
        pass

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass


class TestDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        return DeviceImpl(self.config, self.logger, self.mqtt_client)
