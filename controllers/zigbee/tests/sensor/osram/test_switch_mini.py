from pytest_mock import MockerFixture

from powerpi_common_test.sensor import SensorTestBase
from zigbee_controller.sensor.osram.switch_mini import OsramSwitchMiniSensor


class TestOsramSwitchMiniSensor(SensorTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.logger = mocker.Mock()
        self.controller = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        return OsramSwitchMiniSensor(
            self.logger, self.controller, self.mqtt_client,
            '00:00:00:00:00:00:00:00', '0xAAAA', 'test'
        )

    def test_event(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)
