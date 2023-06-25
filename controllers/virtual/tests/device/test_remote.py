import asyncio
from typing import Optional
from unittest.mock import MagicMock

import pytest
from powerpi_common.device.mixin import AdditionalState

from macro_controller.device.remote import RemoteDevice


class TestRemoteDevice:
    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_turn_x(
        self,
        subject: RemoteDevice,
        powerpi_mqtt_producer: MagicMock,
        state: str
    ):
        assert subject.state == 'unknown'

        self.__schedule_state_change(subject, state=state)

        func = subject.turn_on if state == 'on' else subject.turn_off
        await func()

        topic = 'device/remote/change'
        message = {
            'state': state
        }
        powerpi_mqtt_producer.assert_any_call(topic, message)

        assert subject.state == state

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_turn_x_timeout(
        self,
        subject: RemoteDevice,
        powerpi_mqtt_producer: MagicMock,
        state: str
    ):
        assert subject.state == 'unknown'

        self.__schedule_state_change(subject, state=state, sleep=0.3)

        func = subject.turn_on if state == 'on' else subject.turn_off
        await func()

        topic = 'device/remote/change'
        message = {
            'state': state
        }
        powerpi_mqtt_producer.assert_any_call(topic, message)

        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    @pytest.mark.parametrize('scene', [None, 'default', 'other'])
    @pytest.mark.parametrize('state', [None, 'on', 'off'])
    @pytest.mark.parametrize('use_additional_state', [True, False])
    async def test_change_power_and_additional_state(
        self,
        subject: RemoteDevice,
        powerpi_mqtt_producer: MagicMock,
        scene: Optional[str],
        state: Optional[str],
        use_additional_state: bool
    ):
        # pylint: disable=too-many-arguments

        assert subject.scene == 'default'
        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        additional_state = {'something': 'else'} if use_additional_state \
            else None

        self.__schedule_state_change(subject, scene, state, additional_state)

        await subject.change_power_and_additional_state(
            scene=scene,
            new_state=state,
            new_additional_state=additional_state
        )

        topic = 'device/remote/change'
        message = {}
        if scene is not None:
            message['scene'] = scene
        if state is not None:
            message['state'] = state
        if use_additional_state:
            message['something'] = 'else'

        powerpi_mqtt_producer.assert_any_call(topic, message)

        assert subject.scene == scene if scene is not None else 'default'
        assert subject.state == state if state is not None else 'unknown'

        if use_additional_state:
            assert subject.additional_state.get('something', None) == 'else'

    @pytest.mark.asyncio
    async def test_change_power_and_additional_state_timeout(
        self,
        subject: RemoteDevice,
        powerpi_mqtt_producer: MagicMock
    ):
        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        self.__schedule_state_change(
            subject,
            additional_state={'something': 'else'},
            sleep=0.3
        )

        await subject.change_power_and_additional_state(
            new_state='on',
            new_additional_state={'something': 'else'}
        )

        topic = 'device/remote/change'
        message = {
            'state': 'on',
            'something': 'else'
        }
        powerpi_mqtt_producer.assert_any_call(topic, message)

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
    ):
        return RemoteDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            timeout=0.2,
            name='remote'
        )

    def __schedule_state_change(
        self,
        subject: RemoteDevice,
        scene: Optional[str] = None,
        state: Optional[str] = None,
        additional_state: Optional[AdditionalState] = None,
        sleep=0.1
    ):
        if additional_state is None:
            additional_state = {}

        async def update():
            await asyncio.sleep(sleep)

            message = {}
            if additional_state is not None:
                message = {**additional_state}
            if scene is not None:
                message['scene'] = scene
            if state is not None:
                message['state'] = state

            await subject.on_message(message, subject.name, 'status')

        loop = asyncio.get_event_loop()
        loop.create_task(update())
