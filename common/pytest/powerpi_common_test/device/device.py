import pytest

from abc import ABC, abstractmethod
from datetime import datetime
from pytest_mock import MockerFixture


class DeviceTestBase(ABC):
    pytestmark = pytest.mark.asyncio

    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

    async def test_turn_on(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert subject.state == 'unknown'
        await subject.turn_on()
        assert subject.state == 'on'

    async def test_turn_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert subject.state == 'unknown'
        await subject.turn_off()
        assert subject.state == 'off'

    @pytest.mark.parametrize('times', [1, 2])
    async def test_change_message(self, mocker: MockerFixture, times: int):
        subject = self.get_subject(mocker)

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
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    async def test_wrong_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, 'other', 'change')
        assert subject.state == 'unknown'

    async def test_bad_state_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'notastate',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'
    
    async def test_missing_state_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'
