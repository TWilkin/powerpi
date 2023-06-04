import pytest
from powerpi_common_test.base import BaseTest
from pytest_mock import MockerFixture

from powerpi_common.event.consumer import EventConsumer


class EventHandlerImpl:
    counter = 0

    def __init__(self):
        EventHandlerImpl.counter = 0

    @classmethod
    async def execute(cls, _):
        EventHandlerImpl.counter += 1

        if EventHandlerImpl.counter == 2:
            return True

        return False


class TestEventConsumer(BaseTest):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture):
        config = mocker.Mock()
        config.message_age_cutoff = 120

        event = EventHandlerImpl()

        return EventConsumer(
            config,
            mocker.Mock(),
            'event/MySensor/explode',
            [event, event, event]
        )

    @pytest.mark.parametrize('timestamp,expected', [
        (1685910908 * 1000, 2),
        (None, 2),
        (0, 0)
    ])
    async def test_on_message(self, mocker: MockerFixture, timestamp, expected: bool):
        subject = self.create_subject(mocker)

        message = {}
        if timestamp is not None:
            message['timestamp'] = timestamp

        await subject.on_message(message, 'MySensor', 'explode')

        assert EventHandlerImpl.counter == expected
