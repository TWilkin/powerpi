from datetime import datetime
from typing import Union

from powerpi_common.config.config import Config
from powerpi_common.device import Device
from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.mqtt.consumer import MQTTConsumer
from pytest_mock import MockerFixture

import pytest
from powerpi_common_test.device.base import BaseDeviceTestBase


class DeviceTestBase(BaseDeviceTestBase):
    _initial_state_consumer: Union[MQTTConsumer, None] = None

    @pytest.mark.asyncio
    async def test_turn_on(self, subject: Device):
        assert subject.state == 'unknown'
        await subject.turn_on()
        assert subject.state == 'on'

    @pytest.mark.asyncio
    async def test_turn_off(self, subject: Device):
        assert subject.state == 'unknown'
        await subject.turn_off()
        assert subject.state == 'off'

    @pytest.mark.asyncio
    @pytest.mark.parametrize('times', [1, 2])
    async def test_change_message(self, subject: Device, times: int):
        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        initial_state = 'unknown'
        next_state = 'on'
        for _ in range(1, times):
            assert subject.state == initial_state
            await subject.on_message(message, subject.name, 'change')
            assert subject.state == next_state

            initial_state = next_state
            next_state = 'off' if initial_state == 'on' else 'on'
            message['state'] = next_state

    @pytest.mark.asyncio
    async def test_old_change_message(self, subject: Device):
        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    async def test_wrong_change_message(self, subject: Device):
        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, 'other', 'change')
        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    async def test_bad_state_change_message(self, subject: Device):
        message = {
            'state': 'notastate',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    async def test_missing_state_change_message(self, subject: Device):
        message = {
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    async def test_initial_state_message(self, subject: Device):
        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'

        # first message should set the state
        await self._initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'

        # subsequent messages should be ignored
        message['state'] = 'off'
        await self._initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'

    @pytest.fixture(autouse=True)
    def message_age_cutoff(self, powerpi_config: Config, mocker: MockerFixture):
        mocker.patch.object(powerpi_config, 'message_age_cutoff', 120)

    @pytest.fixture(autouse=True)
    def powerpi_mqtt_initial_state(self, powerpi_mqtt_client: MQTTClient, mocker: MockerFixture):
        def add_consumer(consumer: MQTTConsumer):
            if consumer.topic.endswith('status'):
                self._initial_state_consumer = consumer

        mocker.patch.object(powerpi_mqtt_client, 'add_consumer', add_consumer)
