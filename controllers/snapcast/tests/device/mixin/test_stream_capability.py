import pytest
from powerpi_common.mqtt import MQTTMessage

from snapcast_controller.device.mixin import StreamCapabilityMixin

test_streams = ['Stream 1', 'Stream 2']


class StreamCapabilityDevice(StreamCapabilityMixin):
    counter = 0

    def _broadcast(self, subject: str, message: MQTTMessage):
        self.counter += 1
        assert subject == 'capability'
        assert message == {'streams': test_streams}


class TestStreamCapabilityMixin:
    def test_streams(self, subject: StreamCapabilityMixin):
        result = subject.streams

        assert result is not None
        assert len(result) == 0
        self.assert_broadcast(subject, 0)

        # add streams
        subject.streams = test_streams

        result = subject.streams

        assert result is not None
        assert result == test_streams
        self.assert_broadcast(subject, 1)

    def test_supports_other_capabilities(self, subject: StreamCapabilityDevice):
        assert subject.supports_other_capabilities == {'streams': []}

        # add streams
        subject.streams = test_streams

        assert subject.supports_other_capabilities == {'streams': test_streams}

    @pytest.fixture
    def subject(self):
        return StreamCapabilityDevice()

    def assert_broadcast(self, subject: StreamCapabilityDevice, count: int):
        assert subject.counter == count
