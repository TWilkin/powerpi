from datetime import datetime
from unittest.mock import patch

import pytest
from powerpi_common.logger import Logger

from event.config import EventConfig
from event.services.consumer import EventConsumer


class EventHandlerImpl:
    counter = 0

    def __init__(self):
        EventHandlerImpl.counter = 0

    @classmethod
    def execute(cls, _):
        EventHandlerImpl.counter += 1

        if EventHandlerImpl.counter == 2:
            return True

        return False

    def __str__(self):
        return 'event'


class TestEventConsumer:
    def test_events(self, subject: EventConsumer):
        assert len(subject.events) == 3

    def test_str(self, subject: EventConsumer):
        assert f'{subject}' == 'event/MySensor/explode(event, event, event)'

    @pytest.mark.asyncio
    @pytest.mark.parametrize('timestamp,expected', [
        (1685910908 * 1000, 2),
        (None, 2),
        (0, 0)
    ])
    async def test_on_message(
        self,
        subject: EventConsumer,
        timestamp: int | None,
        expected: bool
    ):
        message = {}
        if timestamp is not None:
            message['timestamp'] = timestamp

        with patch('powerpi_common.mqtt.consumer.datetime') as mock_datetime:
            mock_datetime.utcnow.return_value = datetime(
                2023, 6, 4, 20, 35, 8
            )

            await subject.on_message(message, 'MySensor', 'explode')

        assert EventHandlerImpl.counter == expected

    @pytest.fixture
    def subject(self, powerpi_config: EventConfig, powerpi_logger: Logger):
        event = EventHandlerImpl()

        return EventConsumer(
            powerpi_config,
            powerpi_logger,
            'event/MySensor/explode',
            [event, event, event]
        )
