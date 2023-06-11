from abc import ABC
from typing import Any, Dict, Iterable
from unittest.mock import MagicMock

from powerpi_common.sensor.mixin import BatteryMixin


class BatteryMixinTestBase(ABC):
    def test_on_battery_message_level(
        self,
        subject: BatteryMixin,
        powerpi_mqtt_producer: MagicMock
    ):
        # capture the published messages
        messages = []

        def capture(_: str, message: Dict[str, Any]):
            messages.append(message)

        powerpi_mqtt_producer.side_effect = capture

        levels = [13, 0, 100]
        for level in levels:
            subject.on_battery_change(level)

        assert len(messages) == len(levels)

        for level in levels:
            assert any(
                (message['value'] == level for message in messages)
            )

    def test_on_battery_message_charging(
        self,
        subject: BatteryMixin,
        powerpi_mqtt_producer: MagicMock
    ):
        # capture the published messages
        messages = []

        def capture(_: str, message: Dict[str, Any]):
            messages.append(message)

        powerpi_mqtt_producer.side_effect = capture

        subject.on_battery_change(10, True)
        # repeat won't generate new message
        subject.on_battery_change(10, True)
        subject.on_battery_change(11, False)
        subject.on_battery_change(12, None)
        subject.on_battery_change(13)

        assert len(messages) == 4

        assert once(
            (message['value'] == 10 and message['charging']
             is True for message in messages)
        )

        assert once(
            (message['value'] == 11 and message['charging']
             is False for message in messages)
        )

        assert once(
            (message['value'] == 12 and not hasattr(message, 'charging')
             for message in messages)
        )

        assert once(
            (message['value'] == 13 and not hasattr(message, 'charging')
             for message in messages)
        )


def once(iterable: Iterable[object]):
    found = False

    for i in iterable:
        if i:
            if found:
                # we have our second True, so it's not once
                return False

            found = i

    return found
