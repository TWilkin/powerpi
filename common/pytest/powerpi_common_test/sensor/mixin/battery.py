from abc import ABC
from typing import Any, Dict

from pytest_mock import MockerFixture


class BatteryMixinTestBase(ABC):
    def test_on_battery_message_level(self, mocker: MockerFixture):
        # capture the published messages
        self.messages = []

        def mock_add_producer():
            def add_producer():
                def publish(_: str, message: Dict[str, Any]):
                    self.messages.append(message)

                return publish

            self.mqtt_client.add_producer = add_producer

        subject = self.create_subject(mocker, mock_add_producer)

        levels = [13, 0, 100]
        for level in levels:
            subject.on_battery_change(level)

        assert len(self.messages) == len(levels)

        for level in levels:
            assert any(
                (message['value'] == level for message in self.messages)
            )

    def test_on_battery_message_charging(self, mocker: MockerFixture):
        # capture the published messages
        self.messages = []

        def mock_add_producer():
            def add_producer():
                def publish(_: str, message: Dict[str, Any]):
                    self.messages.append(message)

                return publish

            self.mqtt_client.add_producer = add_producer

        subject = self.create_subject(mocker, mock_add_producer)

        subject.on_battery_change(10, True)
        subject.on_battery_change(11, False)
        subject.on_battery_change(12, None)
        subject.on_battery_change(13)

        assert len(self.messages) == 4

        assert any(
            (message['value'] == 10 and message['charging']
             is True for message in self.messages)
        )

        assert any(
            (message['value'] == 11 and message['charging']
             is False for message in self.messages)
        )

        assert any(
            (message['value'] == 12 and not hasattr(message, 'charging')
             for message in self.messages)
        )

        assert any(
            (message['value'] == 13 and not hasattr(message, 'charging')
             for message in self.messages)
        )
