from pytest_mock import MockerFixture

from powerpi_common.variable.device import DeviceVariable
from powerpi_common_test.variable.variable import VariableTestBase


class TestDeviceVariable(VariableTestBase):
    def create_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        return DeviceVariable(self.config, self.logger, self.mqtt_client, name='TestVariable')
