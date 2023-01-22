from abc import abstractmethod
from datetime import datetime
from typing import Callable, Union

import pytest
from powerpi_common.config.config import Config
from powerpi_common.device import Device
from powerpi_common.mqtt.client import MQTTClient
from powerpi_common.mqtt.consumer import MQTTConsumer
from powerpi_common_test.device.base import (BaseDeviceTestBase,
                                             BaseDeviceTestBaseNew)
from pytest_mock import MockerFixture


class DeviceTestBase(BaseDeviceTestBase):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture, func: Callable[[], None] = None):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        # allow us to do extra mocking before setting up the subject
        if func is not None:
            func()

        return self.get_subject(mocker)

    @abstractmethod
    def get_subject(self, mocker: MockerFixture):
        raise NotImplementedError

    async def test_turn_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        await subject.turn_on()
        assert subject.state == 'on'

    async def test_turn_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        await subject.turn_off()
        assert subject.state == 'off'

    @pytest.mark.parametrize('times', [1, 2])
    async def test_change_message(self, mocker: MockerFixture, times: int):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

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

    async def test_old_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    async def test_wrong_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, 'other', 'change')
        assert subject.state == 'unknown'

    async def test_bad_state_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'notastate',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    async def test_missing_state_change_message(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    async def test_initial_state_message(self, mocker: MockerFixture):
        self.initial_state_consumer = None

        def mock_add_consumer():
            def add_consumer(consumer):
                if consumer.topic.endswith('status'):
                    self.initial_state_consumer = consumer

            self.mqtt_client.add_consumer = add_consumer

        subject = self.create_subject(mocker, mock_add_consumer)

        message = {
            'state': 'on',
            'timestamp': 0
        }

        assert subject.state == 'unknown'

        # first message should set the state
        await self.initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'

        # subsequent messages should be ignored
        message['state'] = 'off'
        await self.initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'


class DeviceTestBaseNew(BaseDeviceTestBaseNew):
    __initial_state_consumer: Union[MQTTConsumer, None] = None

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
        await self.__initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'

        # subsequent messages should be ignored
        message['state'] = 'off'
        await self.__initial_state_consumer.on_message(message, subject.name, 'status')
        assert subject.state == 'on'

    @pytest.fixture(autouse=True)
    def message_age_cutoff(self, powerpi_config: Config, mocker: MockerFixture):
        mocker.patch.object(powerpi_config, 'message_age_cutoff', 120)

    @pytest.fixture(autouse=True)
    def powerpi_mqtt_initial_state(self, powerpi_mqtt_client: MQTTClient, mocker: MockerFixture):
        def add_consumer(consumer: MQTTConsumer):
            if consumer.topic.endswith('status'):
                self.__initial_state_consumer = consumer

        mocker.patch.object(powerpi_mqtt_client, 'add_consumer', add_consumer)
