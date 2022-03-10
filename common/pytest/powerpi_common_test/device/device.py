import pytest

from abc import abstractmethod
from datetime import datetime
from pytest_mock import MockerFixture
from typing import Callable

from powerpi_common_test.device.base import BaseDeviceTestBase


class DeviceTestBase(BaseDeviceTestBase):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture, func: Callable[[], None]=None):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        # allow us to do extra mocking before setting up the subject
        if func is not None:
            func()
        
        return self.get_subject(mocker)

    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

    async def test_turn_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        await subject.turn_on()
        assert subject.state == 'on'

    async def test_turn_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        await subject.turn_off()
        assert subject.state == 'off'

    @pytest.mark.parametrize('times', [1, 2])
    async def test_change_message(self, mocker: MockerFixture, times: int):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        initial_state = 'unknown'
        next_state = 'on'
        for _ in range(1, times):
            assert subject.state == initial_state
            await subject.on_message(message, subject.name, 'change')
            assert subject.state == next_state

            initial_state = next_state
            next_state = 'off' if initial_state == 'on' else 'on'
            message['state'] = next_state

    async def test_old_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    async def test_wrong_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, 'other', 'change')
        assert subject.state == 'unknown'

    async def test_bad_state_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'notastate',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'
    
    async def test_missing_state_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    def test_initial_state_message(self, mocker: MockerFixture):
        self.initial_state_consumer = None

        def mock_add_consumer():
            def add_consumer(consumer):
                if consumer.topic.endswith('status'):
                    self.initial_state_consumer = consumer

            self.mqtt_client.add_consumer = add_consumer

        subject = self.create_subject(mocker, mock_add_consumer)

        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'

        # first message should set the state
        self.initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'

        # subsequent messages should be ignored
        message['state'] = 'off'
        self.initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'
