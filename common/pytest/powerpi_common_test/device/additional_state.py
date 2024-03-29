from datetime import datetime
from typing import Any, Dict
from unittest.mock import MagicMock

from powerpi_common.device import AdditionalStateDevice
from powerpi_common.device.scene_state import ReservedScenes

import pytest

from .device import DeviceTestBase


class AdditionalStateDeviceTestBase(DeviceTestBase):
    @pytest.mark.asyncio
    async def test_on_additional_state_change_implemented(self, subject: AdditionalStateDevice):
        additional_state = await subject.on_additional_state_change({})
        assert additional_state is not None

    def test_additional_state_keys_implemented(self, subject: AdditionalStateDevice):
        # pylint: disable=protected-access
        keys = subject._additional_state_keys()

        assert keys is not None
        assert len(keys) > 0

    @pytest.mark.asyncio
    @pytest.mark.parametrize('scene', [None, 'default'])
    async def test_change_additional_state_message(
        self,
        subject: AdditionalStateDevice,
        scene: str | None
    ):
        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]
        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000),
        }
        message[key] = 1

        if scene is not None:
            message['scene'] = scene

        assert subject.scene == ReservedScenes.DEFAULT
        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.on_message(message, subject.name, 'change')

        assert subject.state == 'on'
        assert subject.additional_state.get(key, None) == 1

    @pytest.mark.asyncio
    async def test_state_change_outputs_additional_state(
        self,
        subject: AdditionalStateDevice,
        powerpi_mqtt_producer: MagicMock
    ):
        # capture the published messages
        messages = []

        def capture(_: str, message: Dict[str, Any]):
            messages.append(message)

        powerpi_mqtt_producer.side_effect = capture

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]
        additional_state = {}
        additional_state[key] = 1
        subject.additional_state = additional_state
        assert subject.additional_state.get(key, None) == 1

        # turn the device on, then off
        for state in ['on', 'off']:
            await subject.change_power(state)
            assert subject.state == state
            assert subject.additional_state.get(key, None) == 1

        # ensure all message are present and contain the additional state
        assert len(messages) == 3
        assert all(key in message for message in messages)

    @pytest.mark.asyncio
    async def test_change_scene(self, subject: AdditionalStateDevice):
        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]

        assert subject.scene == 'default'
        assert subject.additional_state.get(key, None) is None

        await subject.change_scene('other')
        assert subject.scene == 'other'
        assert subject.additional_state.get(key, None) is None

        additional_state = {}
        additional_state[key] = 10
        subject.additional_state = {**additional_state}

        await subject.change_scene('current')
        assert subject.scene == 'other'
        assert subject.additional_state.get(key, None) == 10

        # keep the current state if the scene has none
        await subject.change_scene('default')
        assert subject.scene == 'default'
        assert subject.additional_state.get(key, None) == 10

        additional_state[key] = 30
        subject.additional_state = {**additional_state}
        assert subject.scene == 'default'
        assert subject.additional_state.get(key, None) == 30

        # reverting back to another scene after a state change will return the scene's state
        await subject.change_scene('other')
        assert subject.scene == 'other'
        assert subject.additional_state.get(key, None) == 10

    @pytest.mark.asyncio
    async def test_initial_additional_state_message(self, subject: AdditionalStateDevice):
        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]
        message = {
            'state': 'on',
            'scene': 'other',
            'timestamp': 0,
            'scenes': {
                'another': {}
            }
        }
        message[key] = 10
        message['scenes']['another'][key] = 20

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        # first message should set the state
        await self._initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'
        assert subject.scene == 'other'
        assert subject.additional_state.get(key, None) == 10

        # should also populate the scenes
        await subject.change_scene('another')
        assert subject.additional_state.get(key, None) == 20

        # subsequent messages should be ignored
        message['state'] = 'off'
        message['something'] = 'more'
        await self._initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'
        assert subject.additional_state.get(key, None) == 20

    @pytest.mark.asyncio
    async def test_scene_event_message(self, subject: AdditionalStateDevice):
        scene_event_consumer = self._mqtt_consumers['scene']

        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]

        message = {
            'scene': 'other'
        }

        assert subject.scene == 'default'
        assert subject.state == 'unknown'

        # should change the scene
        await scene_event_consumer.on_message(message, subject.name, 'scene')
        assert subject.scene == 'other'

        # now send additional state to the default scene
        message = {
            'scene': 'default',
        }
        message[key] = 2
        await subject.on_message(message, subject.name, 'change')

        assert subject.scene == 'other'
        assert subject.state == 'unknown'
        assert subject.additional_state.get(key, None) is None

        # now switching back to default should activate the scene's additional state
        message = {
            'scene': 'default'
        }
        await scene_event_consumer.on_message(message, subject.name, 'scene')

        assert subject.scene == 'default'
        assert subject.state == 'unknown'
        assert subject.additional_state.get(key, None) == 2
