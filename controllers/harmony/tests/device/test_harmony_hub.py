from asyncio import Future
from typing import Tuple

import pytest
from harmony_controller.device.harmony_activity import HarmonyActivityDevice
from harmony_controller.device.harmony_hub import HarmonyHubDevice
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from pytest_mock import MockerFixture


class TestHarmonyHubDevice(DeviceTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()
        self.harmony_client = mocker.Mock()

        self.__hub_name = 'TestHub'

        self.activities = [HarmonyActivityDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            name=f'activity{i}',
            activity_name=f'Test Activity {i}',
            hub=self.__hub_name
        ) for i in range(2)]

        # add an activity from a different hub
        self.unmatched_activity = HarmonyActivityDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            name='wronghubactivity',
            activity_name=f'Test Activity 0',
            hub='WrongHub'
        )

        self.config_data = {
            'activity': [
                {'label': 'PowerOff', 'id': -1},
                {'label': 'Test Activity 0', 'id': 1000},
                {'label': 'Test Missing Activity', 'id': 1337},
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
        for method in ['get_current_activity', 'start_activity', 'power_off']:
            mocker.patch.object(
                self.harmony_client,
                method,
                return_value=future
            )

        hub = HarmonyHubDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, self.harmony_client,
            name=self.__hub_name, poll_frequency=120
        )

        # device manager will include other activities and the hub
        devices = self.activities.copy()
        devices.extend([hub, self.unmatched_activity])
        self.device_manager.devices = {
            device.name: device for device in devices
        }

        return hub

    @pytest.mark.first
    async def test_config_cache(self, mocker: MockerFixture):
        # this test has to run first because the cache is not reset
        subject = self.create_subject(mocker)

        # will hit client once
        await subject.start_activity('')
        await subject.start_activity('')

    def test_activities(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        activities = subject.activities
        assert len(activities) == 2
        assert all(
            (activity.hub_name == self.__hub_name for activity in activities)
        )

    async def test_power_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

        await subject.turn_off()

        self.harmony_client.power_off.assert_called_once()

        assert subject.state == 'off'
        assert self.activities[0].state == 'off'
        assert self.activities[1].state == 'off'
        assert self.unmatched_activity.state == 'unknown'

    async def test_power_off_error(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        async def power_off():
            raise Exception('error')
        self.harmony_client.power_off = power_off

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

        await subject.turn_off()

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

    async def test_start_activity(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

        # will be called
        await subject.start_activity(self.config_data['activity'][1]['label'])

        # will not be called
        await subject.start_activity('Not An Activity')

        self.harmony_client.start_activity.assert_called_once_with(
            self.config_data['activity'][1]['id']
        )

        # update state of other activities, but not the one we're starting
        assert subject.state == 'on'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'off'
        assert self.unmatched_activity.state == 'unknown'

    async def test_start_activity_error(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        async def start_activity(_: str):
            raise Exception('error')
        self.harmony_client.start_activity = start_activity

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

        error = None
        # pylint: disable=broad-except
        try:
            await subject.start_activity(self.config_data['activity'][1]['label'])
        except Exception as e:
            # we're expecting this
            error = e
        assert error is not None

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

    @pytest.mark.parametrize('test_state', [(-1, 'off', 'off', 'off'), (1000, 'on', 'on', 'off'), (13, 'on', 'off', 'on')])
    async def test_poll(self, mocker: MockerFixture, test_state: Tuple[int, str, str, str]):
        subject = self.create_subject(mocker)

        current_activity = Future()
        current_activity.set_result(test_state[0])
        mocker.patch.object(
            self.harmony_client,
            'get_current_activity',
            return_value=current_activity
        )

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

        await subject.poll()

        assert subject.state == test_state[1]
        assert self.activities[0].state == test_state[2]
        assert self.activities[1].state == test_state[3]
        assert self.unmatched_activity.state == 'unknown'

    async def test_poll_error(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        async def get_current_activity():
            raise Exception('error')
        self.harmony_client.get_current_activity = get_current_activity

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'

        await subject.poll()

        assert subject.state == 'unknown'
        assert self.activities[0].state == 'unknown'
        assert self.activities[1].state == 'unknown'
        assert self.unmatched_activity.state == 'unknown'
