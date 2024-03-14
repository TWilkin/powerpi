import pytest

from event.config import EventConfig


class TestEventConfig:
    def test_used_config(self, subject: EventConfig):
        assert subject.used_config == ['devices', 'events']

    @pytest.fixture
    def subject(self):
        return EventConfig()
