from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from harmony_controller.device.harmony_activity import HarmonyActivityDevice


class TestHarmonyActivityDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.harmony_hub = mocker.Mock()

        mocker.patch.object(
            self.device_manager,
            'get_device',
            return_value=self.harmony_hub
        )

        return HarmonyActivityDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, 'test', 'hub'
        )

    def test_turn_on_hub(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.turn_on()

        self.harmony_hub.start_activity.assert_called_once_with('test')

    def test_turn_off_hub(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.turn_off()

        self.harmony_hub.turn_off.assert_called_once()
