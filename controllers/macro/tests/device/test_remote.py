import asyncio
from typing import Union
from unittest.mock import MagicMock

import pytest
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

        self.__schedule_state_change(subject, state)

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

        self.__schedule_state_change(subject, state, sleep=0.3)

        func = subject.turn_on if state == 'on' else subject.turn_off
        await func()

        topic = 'device/remote/change'
        message = {
            'state': state
        }
        powerpi_mqtt_producer.assert_any_call(topic, message)

        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [None, 'on', 'off'])
    @pytest.mark.parametrize('use_additional_state', [True, False])
    async def test_change_power_and_additional_state(
        self,
        subject: RemoteDevice,
        powerpi_mqtt_producer: MagicMock,
        state: Union[str, None],
        use_additional_state: bool
    ):
        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        additional_state = {'something': 'else'} if use_additional_state \
            else None

        self.__schedule_state_change(subject, state, additional_state)

        await subject.change_power_and_additional_state(state, additional_state)

        topic = 'device/remote/change'
        message = {}
        if state is not None:
            message['state'] = state
        if use_additional_state:
            message['something'] = 'else'

        powerpi_mqtt_producer.assert_any_call(topic, message)

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

        await subject.change_power_and_additional_state('on', {'something': 'else'})

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
        state: str = None,
        additional_state=None,
        sleep=0.1
    ):
        if additional_state is None:
            additional_state = {}

        async def update():
            await asyncio.sleep(sleep)
            subject.set_state_and_additional(state, additional_state)

        loop = asyncio.get_event_loop()
        loop.create_task(update())
