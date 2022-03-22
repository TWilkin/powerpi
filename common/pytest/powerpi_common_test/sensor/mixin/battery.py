from abc import ABC
from typing import Any, Dict

from pytest_mock import MockerFixture


class BatteryMixinTestBase(ABC):
    def test_on_battery_message(self, mocker: MockerFixture):
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
