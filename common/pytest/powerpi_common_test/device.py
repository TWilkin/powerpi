from abc import abstractmethod
from datetime import datetime

from pytest_mock import MockerFixture


class DeviceTestBase(object):
    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

    def test_turn_on(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert subject.state == 'unknown'
        subject.turn_on()
        assert subject.state == 'on'

    def test_turn_off(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        assert subject.state == 'unknown'
        subject.turn_off()
        assert subject.state == 'off'

    def test_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, subject.name, 'change')
        assert subject.state == 'on'

    def test_old_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, subject.name, 'change')
        assert subject.state == 'unknown'

    def test_wrong_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, 'other', 'change')
        assert subject.state == 'unknown'

    def test_bad_state_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'notastate',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, subject.name, 'change')
        assert subject.state == 'unknown'
