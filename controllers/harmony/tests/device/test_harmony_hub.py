import pytest

from asyncio import Future
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
        config_result = Future()
        config_result.set_result(self.config_data)
        mocker.patch.object(
            self.harmony_client,
            'get_config',
            return_value=config_result
        )

        future = Future()
        future.set_result(None)
        for method in ['start_activity', 'power_off']:
            mocker.patch.object(
                self.harmony_client,
                method,
                return_value=future
            )

        return HarmonyHubDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, self.harmony_client, 'TestHub'
        )

    async def test_power_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'

        await subject.turn_off()

        self.harmony_client.power_off.assert_called_once()

        assert self.activities[0].state == 'off'
        assert self.activities[1].state == 'off'

    async def test_start_activity(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'

        # will be called
        await subject.start_activity(self.config_data['activity'][1]['label'])

        # will not be called
        await subject.start_activity('Not An Activity')

        self.harmony_client.start_activity.assert_called_once_with(
            self.config_data['activity'][1]['id']
        )

        # update state of other activities, but not the one we're starting
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'off'

    async def test_config_and_activities_cache(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        # will hit client once
        await subject.start_activity('')
        await subject.start_activity('')

        self.harmony_client.get_config.assert_called_once()

    @pytest.mark.parametrize('test_state', [(-1, 'off', 'off'), (1000, 'on', 'off'), (13, 'off', 'on')])
    async def test_poll(self, mocker: MockerFixture, test_state: tuple):
        subject = self.get_subject(mocker)

        current_activity = Future()
        current_activity.set_result(test_state[0])

        mocker.patch.object(
            self.harmony_client,
            'get_current_activity',
            return_value=current_activity
        )

        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'

        await subject.poll()

        assert self.activities[0].state == test_state[1]
        assert self.activities[1].state == test_state[2]
