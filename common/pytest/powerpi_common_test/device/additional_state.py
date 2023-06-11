from datetime import datetime
from typing import Any, Dict
from unittest.mock import MagicMock

from powerpi_common.device import AdditionalStateDevice

import pytest

from .device import DeviceTestBase


class AdditionalStateDeviceTestBase(DeviceTestBase):
    @pytest.mark.asyncio
    async def test_on_additional_state_change_implemented(self, subject: AdditionalStateDevice):
        additional_state = await subject.on_additional_state_change({})
        assert additional_state is not None

    def test_additional_state_keys_implemented(self, subject: AdditionalStateDevice):
        # pylint: disable=protected-access
        keys = subject._additional_state_keys()

        assert keys is not None
        assert len(keys) > 0

    @pytest.mark.asyncio
    async def test_change_additional_state_message(self, subject: AdditionalStateDevice):
        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]
        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000),
        }
        message[key] = 1

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.on_message(message, subject.name, 'change')

        assert subject.state == 'on'
        assert subject.additional_state.get(key, None) == 1

    @pytest.mark.asyncio
    async def test_state_change_outputs_additional_state(
        self,
        subject: AdditionalStateDevice,
        powerpi_mqtt_producer: MagicMock
    ):
        # capture the published messages
        messages = []

        def capture(_: str, message: Dict[str, Any]):
            messages.append(message)

        powerpi_mqtt_producer.side_effect = capture

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]
        additional_state = {}
        additional_state[key] = 1
        subject.additional_state = additional_state
        assert subject.additional_state.get(key, None) == 1

        # turn the device on, then off
        for state in ['on', 'off']:
            await subject.change_power(state)
            assert subject.state == state
            assert subject.additional_state.get(key, None) == 1

        # ensure all message are present and contain the additional state
        assert len(messages) == 3
        assert all(key in message for message in messages)

    @pytest.mark.asyncio
    async def test_initial_additional_state_message(self, subject: AdditionalStateDevice):
        # pylint: disable=protected-access
        key = subject._additional_state_keys()[0]
        message = {
            'state': 'on',
            'timestamp': 0,
        }
        message[key] = 1

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        # first message should set the state
        await self._initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'
        assert subject.additional_state.get(key, None) == 1

        # subsequent messages should be ignored
        message['state'] = 'off'
        message['something'] = 'more'
        await self._initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'
        assert subject.additional_state.get(key, None) == 1
