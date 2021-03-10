from pytest_mock import MockerFixture

from powerpi_common_test.device import DeviceTestBase
from harmony_controller.device.harmony_hub import HarmonyHubDevice


class MockClient(object):
    def __init__(self, mocker: MockerFixture):
        self.__client = mocker.Mock()

    @property
    def client(self):
        return self.__client

    def __enter__(self):
        return self.__client

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass


class TestHarmonyHubDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.harmony_client = MockClient(mocker)

        return HarmonyHubDevice(
            self.config, self.logger, self.mqtt_client, self.harmony_client, 'test'
        )

    def test_power_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        subject.turn_off()

        self.harmony_client.client.power_off.assert_called_once()

    def test_start_activity(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        config = {
            'activity': [
                {'label': 'Test Activity 1', 'id': 1000},
                {'label': 'Test Activity 2', 'id': 13}
            ]
        }

        mocker.patch.object(
            self.harmony_client.client,
            'get_config',
            return_value=config
        )

        # will be called
        subject.start_activity(config['activity'][1]['label'])

        # will not be called
        subject.start_activity('Not An Activity')

        self.harmony_client.client.start_activity.assert_called_once_with(
            config['activity'][1]['id']
        )

    def test_config_and_activities_cache(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        config = {
            'activity': [
                {'label': 'Test Activity 1', 'id': 1000}
            ]
        }

        mocker.patch.object(
            self.harmony_client.client,
            'get_config',
            return_value=config
        )

        # will hit client once
        subject.start_activity('')
        subject.start_activity('')

        self.harmony_client.client.get_config.assert_called_once()
