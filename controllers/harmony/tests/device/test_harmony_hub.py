import pytest

from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common_test.device import DeviceTestBase
from harmony_controller.device.harmony_activity import HarmonyActivityDevice
from harmony_controller.device.harmony_hub import HarmonyHubDevice


class TestHarmonyHubDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.harmony_client = mocker.Mock()

        self.activities = [HarmonyActivityDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            name=f'activity{i}',
            activity_name=f'Test Activity {i}',
            hub='TestHub'
        ) for i in range(2)]

        self.device_manager.devices = {
            device.name: device for device in self.activities
        }

        self.config_data = {
            'activity': [
                {'label': 'PowerOff', 'id': -1},
                {'label': 'Test Activity 0', 'id': 1000},
                {'label': 'Test Activity 1', 'id': 13}
            ]
        }
        mocker.patch.object(
            self.harmony_client,
            'get_config',
            return_value=self.config_data
        )

        return HarmonyHubDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, self.harmony_client, 'TestHub'
        )

    def test_power_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'

        subject.turn_off()

        self.harmony_client.power_off.assert_called_once()

        assert self.activities[0].state == 'off'
        assert self.activities[1].state == 'off'

    def test_start_activity(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'

        # will be called
        subject.start_activity(self.config_data['activity'][1]['label'])

        # will not be called
        subject.start_activity('Not An Activity')

        self.harmony_client.start_activity.assert_called_once_with(
            self.config_data['activity'][1]['id']
        )

        # update state of other activities, but not the one we're starting
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'off'

    def test_config_and_activities_cache(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        # will hit client once
        subject.start_activity('')
        subject.start_activity('')

        self.harmony_client.get_config.assert_called_once()

    @pytest.mark.parametrize('test_state', [(-1, 'off', 'off'), (1000, 'on', 'off'), (13, 'off', 'on')])
    def test_poll(self, mocker: MockerFixture, test_state: tuple):
        subject = self.get_subject(mocker)

        mocker.patch.object(
            self.harmony_client,
            'get_current_activity',
            return_value=test_state[0]
        )

        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'

        subject.poll()

        assert self.activities[0].state == test_state[1]
        assert self.activities[1].state == test_state[2]
