import asyncio
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
    
    @pytest.mark.parametrize('state', [('on'), ('off')])
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

    @pytest.mark.parametrize('state', [('on'), ('off')])
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

    def __schedule_state_change(self, subject: RemoteDevice, state: str):
        async def update():
            await asyncio.sleep(0.1)
            subject.state = state
        
        loop = asyncio.get_event_loop()
        loop.create_task(update())
