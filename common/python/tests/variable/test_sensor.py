from pytest_mock import MockerFixture

from powerpi_common.variable.sensor import SensorVariable
from powerpi_common_test.variable.variable import VariableTestBase


class TestSensorVariable(VariableTestBase):
    def create_subject(self, mocker: MockerFixture):
        self.mqtt_client = mocker.Mock()

        return SensorVariable(self.mqtt_client, name='TestVariable')
