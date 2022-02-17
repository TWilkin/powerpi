from pytest_mock import MockerFixture

from powerpi_common.device import ThreadedDevice
from powerpi_common_test.device import DeviceTestBase


class DeviceImpl(ThreadedDevice):
    def __init__(self, config, logger, mqtt_client):
        ThreadedDevice.__init__(
            self, config, logger, mqtt_client, 'test'
        )
    
    def _poll(self):
        pass

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass


class TestThreadedDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        return DeviceImpl(self.config, self.logger, self.mqtt_client)
