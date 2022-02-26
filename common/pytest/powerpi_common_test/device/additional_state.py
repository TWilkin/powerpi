from datetime import datetime
from pytest_mock import MockerFixture

from .device import DeviceTestBase


class AdditionalStateDeviceTestBase(DeviceTestBase):
    async def test_on_additional_state_change_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        additional_state = await subject.on_additional_state_change({})
        assert additional_state is not None
    
    def test_additional_state_keys_implemented(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        keys = subject._additional_state_keys()

        assert keys is not None
        assert len(keys) > 0
    
    async def test_change_additional_state_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        key = subject._additional_state_keys()[0]
        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000),
            'something': 'else'
        }
        message[key] = 1

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.on_message(message, subject.name, 'change')
    
        assert subject.state == 'on'
        assert subject.additional_state.get('something', None) is None
        assert subject.additional_state.get(key, None) == 1
    
    def test_initial_additional_state_message(self, mocker: MockerFixture):
        self.initial_state_consumer = None

        def mock_add_consumer():
            def add_consumer(consumer):
                if consumer.topic.endswith('status'):
                    self.initial_state_consumer = consumer

            self.mqtt_client.add_consumer = add_consumer

        subject = self.create_subject(mocker, mock_add_consumer)

        key = subject._additional_state_keys()[0]
        message = {
            'state': 'on',
            'timestamp': 0,
            'something': 'else'
        }
        message[key] = 1

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        # first message should set the state
        self.initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'
        assert subject.additional_state.get('something', None) is None
        assert subject.additional_state.get(key, None) == 1

        # subsequent messages should be ignored
        message['state'] = 'off'
        message['something'] = 'more'
        self.initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'
        assert subject.additional_state.get('something', None) is None
        assert subject.additional_state.get(key, None) == 1
