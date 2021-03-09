from datetime import datetime

from pytest_mock import MockerFixture

from energenie_controller.device.socket import SocketDevice


class SocketDeviceImpl(SocketDevice):
    def __init__(self, fixture):
        self.config = fixture.Mock()
        self.logger = fixture.Mock()
        self.mqtt_client = fixture.Mock()

        SocketDevice.__init__(
            self, self.config, self.logger, self.mqtt_client, 'test'
        )


class TestSocketDevice(object):
    def get_subject(self, mocker: MockerFixture):
        return SocketDeviceImpl(mocker)

    def test_run(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.counter = 0

        def func(a, b):
            self.counter += 1
            assert a == 1
            assert b == 2

        subject._run(func, 'blah', 1, 2)

        assert self.counter == 4

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

        mocker.patch.object(subject.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, subject.name, 'change')
        assert subject.state == 'on'

    def test_old_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(subject.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, subject.name, 'change')
        assert subject.state == 'unknown'

    def test_wrong_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(subject.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, 'other', 'change')
        assert subject.state == 'unknown'

    def test_bad_state_change_message(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        mocker.patch.object(subject.config, 'message_age_cutoff', 120)

        message = {
            'state': 'notastate',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        subject.on_message(None, None, message, subject.name, 'change')
        assert subject.state == 'unknown'
