from asyncio import Future
from typing import List, Tuple
from unittest.mock import MagicMock

import pytest
from powerpi_common.device import DeviceManager
from powerpi_common_test.device import DeviceTestBaseNew
from powerpi_common_test.device.mixin import PollableMixinTestBaseNew
from pytest_mock import MockerFixture

from harmony_controller.device.harmony_activity import HarmonyActivityDevice
from harmony_controller.device.harmony_hub import HarmonyHubDevice


class TestHarmonyHubDevice(DeviceTestBaseNew, PollableMixinTestBaseNew):

    __hub_name = 'TestHub'

    @pytest.mark.asyncio
    @pytest.mark.first
    async def test_config_cache(self, subject: HarmonyHubDevice):
        # this test has to run first because the cache is not reset

        # will hit client once
        await subject.start_activity('')
        await subject.start_activity('')

    def test_activities(self, subject: HarmonyHubDevice):
        activities = subject.activities
        assert len(activities) == 2
        assert all(
            (activity.hub_name == self.__hub_name for activity in activities)
        )

    @pytest.mark.asyncio
    async def test_power_off(
        self,
        subject: HarmonyHubDevice,
        harmony_client: MagicMock,
        activities: List[HarmonyActivityDevice],
        unmatched_activity: HarmonyActivityDevice
    ):
        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

        await subject.turn_off()

        harmony_client.power_off.assert_called_once()

        assert subject.state == 'off'
        assert activities[0].state == 'off'
        assert activities[1].state == 'off'
        assert unmatched_activity.state == 'unknown'

    @pytest.mark.asyncio
    async def test_power_off_error(
        self,
        subject: HarmonyHubDevice,
        harmony_client: MagicMock,
        activities: List[HarmonyActivityDevice],
        unmatched_activity: HarmonyActivityDevice
    ):
        async def power_off():
            raise KeyError('error')

        harmony_client.power_off = power_off

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

        await subject.turn_off()

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

    @pytest.mark.asyncio
    async def test_start_activity(
        self,
        subject: HarmonyHubDevice,
        harmony_client: MagicMock,
        activities: List[HarmonyActivityDevice],
        unmatched_activity: HarmonyActivityDevice,
        harmony_config
    ):
        # pylint: disable=too-many-arguments

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

        # will be called
        await subject.start_activity(harmony_config['activity'][1]['label'])

        # will not be called
        await subject.start_activity('Not An Activity')

        harmony_client.start_activity.assert_called_once_with(
            harmony_config['activity'][1]['id']
        )

        # update state of other activities, but not the one we're starting
        assert subject.state == 'on'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'off'
        assert unmatched_activity.state == 'unknown'

    @pytest.mark.asyncio
    async def test_start_activity_error(
        self,
        subject: HarmonyHubDevice,
        harmony_client: MagicMock,
        activities: List[HarmonyActivityDevice],
        unmatched_activity: HarmonyActivityDevice,
        harmony_config
    ):
        # pylint: disable=too-many-arguments

        async def start_activity(_: str):
            raise KeyError('error')
        harmony_client.start_activity = start_activity

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

        error = None
        # pylint: disable=broad-except
        try:
            await subject.start_activity(harmony_config['activity'][1]['label'])
        except KeyError as ex:
            # we're expecting this
            error = ex
        assert error is not None

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

    @pytest.mark.asyncio
    @pytest.mark.parametrize('current_state,hub_state,activity1_state,activity2_state', [
        (-1, 'off', 'off', 'off'),
        (1000, 'on', 'on', 'off'),
        (13, 'on', 'off', 'on')
    ])
    async def test_poll(
        self,
        subject: HarmonyHubDevice,
        harmony_client: MagicMock,
        activities: List[HarmonyActivityDevice],
        unmatched_activity: HarmonyActivityDevice,
        mocker: MockerFixture,
        current_state: int,
        hub_state: str,
        activity1_state: str,
        activity2_state: str
    ):
        # pylint: disable=too-many-arguments

        current_activity = Future()
        current_activity.set_result(current_state)
        mocker.patch.object(
            harmony_client,
            'get_current_activity',
            return_value=current_activity
        )

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

        await subject.poll()

        assert subject.state == hub_state
        assert activities[0].state == activity1_state
        assert activities[1].state == activity2_state
        assert unmatched_activity.state == 'unknown'

    @pytest.mark.asyncio
    async def test_poll_error(
        self,
        subject: HarmonyHubDevice,
        harmony_client: MagicMock,
        activities: List[HarmonyActivityDevice],
        unmatched_activity: HarmonyActivityDevice,
    ):
        async def get_current_activity():
            raise KeyError('error')
        harmony_client.get_current_activity = get_current_activity

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

        await subject.poll()

        assert subject.state == 'unknown'
        assert activities[0].state == 'unknown'
        assert activities[1].state == 'unknown'
        assert unmatched_activity.state == 'unknown'

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager: DeviceManager,
        harmony_client,
        harmony_config,
        activities: List[HarmonyActivityDevice],
        unmatched_activity: HarmonyActivityDevice,
        mocker: MockerFixture
    ):
        # pylint: disable=too-many-arguments

        hub = HarmonyHubDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_device_manager,
            harmony_client,
            name=self.__hub_name,
            poll_frequency=120
        )

        devices = activities.copy()
        devices.extend([hub, unmatched_activity])
        powerpi_device_manager.devices = {
            device.name: device for device in devices
        }

        config_result = Future()
        config_result.set_result(harmony_config)
        mocker.patch.object(
            harmony_client,
            'get_config',
            return_value=config_result
        )

        return hub

    @pytest.fixture
    def harmony_config(self):
        return {
            'activity': [
                {'label': 'PowerOff', 'id': -1},
                {'label': 'Test Activity 0', 'id': 1000},
                {'label': 'Test Missing Activity', 'id': 1337},
                {'label': 'Test Activity 1', 'id': 13}
            ]
        }

    @pytest.fixture
    def activities(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager
    ):
        return [HarmonyActivityDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_device_manager,
            name=f'activity{i}',
            activity_name=f'Test Activity {i}',
            hub=self.__hub_name
        ) for i in range(2)]

    @pytest.fixture
    def unmatched_activity(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager
    ):
        return HarmonyActivityDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_device_manager,
            name='wronghubactivity',
            activity_name='Test Activity 0',
            hub='WrongHub'
        )
