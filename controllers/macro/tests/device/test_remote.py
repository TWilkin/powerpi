import asyncio

from typing import Union

import pytest

from pytest_mock import MockerFixture

from macro_controller.device.remote import RemoteDevice
from powerpi_common_test.mqtt import mock_producer


class TestRemoteDevice(object):
    pytestmark = pytest.mark.asyncio

    def get_subject(self, mocker: MockerFixture, timeout: float):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        self.publish = mock_producer(mocker, self.mqtt_client)

        return RemoteDevice(
            self.config, self.logger, self.mqtt_client, 'remote', timeout
        )

    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_turn_x(self, mocker: MockerFixture, state: str):
        subject = self.get_subject(mocker, 0.2)

        assert subject.state == 'unknown'

        self.__schedule_state_change(subject, state)

        func = subject.turn_on if state == 'on' else subject.turn_off
        await func()

        topic = 'device/remote/change'
        message = {
            'state': state
        }
        self.publish.assert_any_call(topic, message)

        assert subject.state == state

    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_turn_x_timeout(self, mocker: MockerFixture, state: str):
        subject = self.get_subject(mocker, 0.1)

        assert subject.state == 'unknown'

        func = subject.turn_on if state == 'on' else subject.turn_off
        await func()

        topic = 'device/remote/change'
        message = {
            'state': state
        }
        self.publish.assert_any_call(topic, message)

        assert subject.state == 'unknown'

    @pytest.mark.parametrize('state', [None, 'on', 'off'])
    @pytest.mark.parametrize('use_additional_state', [True, False])
    async def test_change_power_and_additional_state(
        self,
        mocker: MockerFixture,
        state: Union[str, None],
        use_additional_state: bool
    ):
        subject = self.get_subject(mocker, 0.2)

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

        self.publish.assert_any_call(topic, message)

        assert subject.state == state if state is not None else 'unknown'

        if use_additional_state:
            assert subject.additional_state.get('something', None) == 'else'

    async def test_change_power_and_additional_state_timeout(self, mocker: MockerFixture):
        subject = self.get_subject(mocker, 0.1)

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.change_power_and_additional_state('on', {'something': 'else'})

        topic = 'device/remote/change'
        message = {
            'state': 'on',
            'something': 'else'
        }
        self.publish.assert_any_call(topic, message)

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

    def __schedule_state_change(self, subject: RemoteDevice, state: str, additional_state=None):
        if additional_state == None:
            additional_state = {}

        async def update():
            await asyncio.sleep(0.1)
            subject.set_state_and_additional(state, additional_state)

        loop = asyncio.get_event_loop()
        loop.create_task(update())
