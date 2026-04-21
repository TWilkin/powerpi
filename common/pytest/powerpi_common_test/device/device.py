from datetime import datetime, timezone
from unittest.mock import PropertyMock

from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.device.geofence import Geofence
from powerpi_common.mqtt import MQTTClient, MQTTConsumer, MQTTConsumerPriority
from pytest_mock import MockerFixture

import pytest
from powerpi_common_test.device.base import BaseDeviceTestBase


class DeviceTestBase(BaseDeviceTestBase):
    _mqtt_consumers: dict[str, MQTTConsumer] = {}

    @property
    def _initial_state_consumer(self):
        return self._mqtt_consumers['status']

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
    @pytest.mark.parametrize('active', [True, False])
    async def test_turn_on_geofence(
        self,
        subject_geofence: Device,
        geofence,
        powerpi_mqtt_producer,
        active: bool
    ):
        type(geofence).state = PropertyMock(
            return_value='on' if active else 'off'
        )

        assert subject_geofence.state == 'unknown'
        await subject_geofence.turn_on()

        if active:
            assert subject_geofence.state == 'unknown'
        else:
            assert subject_geofence.state == 'on'

        # we should broadcast regardless of whether the geofence is active
        powerpi_mqtt_producer.assert_called_once()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('active', [True, False])
    async def test_turn_off_geofence(
        self,
        subject_geofence: Device,
        geofence,
        powerpi_mqtt_producer,
        active: bool
    ):
        type(geofence).state = PropertyMock(
            return_value='on' if active else 'off'
        )

        assert subject_geofence.state == 'unknown'
        await subject_geofence.turn_off()

        if active:
            assert subject_geofence.state == 'unknown'
        else:
            assert subject_geofence.state == 'off'

        # we should broadcast regardless of whether the geofence is active
        powerpi_mqtt_producer.assert_called_once()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('times', [1, 2])
    async def test_change_message(self, subject: Device, times: int):
        message = {
            'state': 'on',
            'timestamp': int(datetime.now(timezone.utc).timestamp() * 1000)
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
            'timestamp': int(datetime.now(timezone.utc).timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, 'other', 'change')
        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    async def test_bad_state_change_message(self, subject: Device):
        message = {
            'state': 'notastate',
            'timestamp': int(datetime.now(timezone.utc).timestamp() * 1000)
        }

        assert subject.state == 'unknown'
        await subject.on_message(message, subject.name, 'change')
        assert subject.state == 'unknown'

    @pytest.mark.asyncio
    async def test_missing_state_change_message(self, subject: Device):
        message = {
            'timestamp': int(datetime.now(timezone.utc).timestamp() * 1000)
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

    @pytest.fixture()
    def subject_geofence(
        self,
        subject: Device,
        powerpi_variable_manager
    ):
        # pylint:disable=protected-access
        subject._Device__geofence = Geofence(
            powerpi_variable_manager,
            'TestGeofence'
        )

        return subject

    @pytest.fixture()
    def geofence(
        self,
        powerpi_variable_manager,
        mocker: MockerFixture
    ):
        geofence = mocker.MagicMock()
        type(geofence).state = PropertyMock(return_value='off')

        powerpi_variable_manager.get_geofence = \
            lambda name: geofence if name == 'TestGeofence' else None

        return geofence

    @pytest.fixture(autouse=True)
    def message_age_cutoff(self, powerpi_config: Config, mocker: MockerFixture):
        mocker.patch.object(powerpi_config, 'message_age_cutoff', 120)

    @pytest.fixture(autouse=True)
    def powerpi_mqtt_consumers(self, powerpi_mqtt_client: MQTTClient, mocker: MockerFixture):
        def add_consumer(
            consumer: MQTTConsumer,
            _priority: MQTTConsumerPriority = MQTTConsumerPriority.VALUE
        ):
            split = consumer.topic.split('/')
            self._mqtt_consumers[split[-1]] = consumer

        mocker.patch.object(powerpi_mqtt_client, 'add_consumer', add_consumer)
