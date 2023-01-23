from abc import ABC
from typing import Any, Dict
from unittest.mock import MagicMock

from powerpi_common.device.mixin import CapabilityMixin
from powerpi_common.util.data import Range


class CapabilityMixinTestBase(ABC):
    def test_on_capability_change(self, subject: CapabilityMixin, powerpi_mqtt_producer: MagicMock):
        messages = []

        def capture(_: str, message: Dict[str, Any]):
            messages.append(message)

        powerpi_mqtt_producer.side_effect = capture

        subject.on_capability_change({})
        assert len(messages) == 0

        capabilities = [
            {'brightness': True},
            {'brightness': False},
            {'colour': {
                'temperature': False
            }},
            {'colour': {
                'hue': True,
                'saturation': True
            }},
            {'colour': {
                'hue': False,
                'saturation': False
            }}
        ]

        for capability in capabilities:
            messages = []

            subject.on_capability_change(capability)

            assert len(messages) == 1
            assert messages[0] == capability

        # special case for temperature range
        messages = []

        subject.on_capability_change({
            'colour': {'temperature': Range(1000, 2000)}
        })

        assert len(messages) == 1
        assert messages[0] == {'colour': {
            'temperature': {'min': 1000, 'max': 2000}}
        }
