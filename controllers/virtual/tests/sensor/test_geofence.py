from datetime import datetime, timezone
from unittest.mock import Mock, PropertyMock

import pytest

from powerpi_common.device import DeviceStatus
from powerpi_common.mqtt import MQTTConsumer, MQTTConsumerPriority
from powerpi_common_test.sensor import SensorTestBase
from pytest_mock import MockerFixture

from virtual_controller.sensor.geofence import GeofenceSensor


class TestGeofence(SensorTestBase):

    @pytest.mark.asyncio
    async def test_initialise(
        self,
        subject: GeofenceSensor,
        powerpi_variable_manager: Mock,
        powerpi_mqtt_producer: Mock,
        mocker: MockerFixture
    ):
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.initialise()

        powerpi_variable_manager.get_device.assert_has_calls([
            mocker.call('Device')
        ])

        powerpi_variable_manager.get_presence.assert_has_calls([
            mocker.call('Presence')
        ])

        powerpi_variable_manager.get_sensor.assert_has_calls([
            mocker.call('Sensor', 'motion')
        ])

        powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    async def test_on_message_device(
        self,
        subject: GeofenceSensor,
        powerpi_mqtt_producer: Mock,
        now: int
    ):
        await subject.initialise()

        message = {
            'state': 'on',
            'timestamp': now
        }

        await self.consumers['device/Device/status'] \
            .on_message(message, 'Device', 'state')

        assert subject.state == DeviceStatus.OFF

        powerpi_mqtt_producer.assert_called_once_with(
            'geofence/MyGeofence/status',
            {'state': DeviceStatus.OFF}
        )

    @pytest.mark.asyncio
    async def test_on_message_presence(
        self,
        subject: GeofenceSensor,
        powerpi_mqtt_producer: Mock,
        now: int
    ):
        await subject.initialise()

        message = {
            'state': 'present',
            'timestamp': now
        }

        await self.consumers['presence/Presence/status'] \
            .on_message(message, 'Presence', 'state')

        assert subject.state == DeviceStatus.OFF

        powerpi_mqtt_producer.assert_called_once_with(
            'geofence/MyGeofence/status',
            {'state': DeviceStatus.OFF}
        )

    @pytest.mark.asyncio
    async def test_on_message_sensor(
        self,
        subject: GeofenceSensor,
        powerpi_mqtt_producer: Mock,
        now: int
    ):
        await subject.initialise()

        message = {
            'state': 'detected',
            'timestamp': now
        }

        await self.consumers['event/Sensor/motion'] \
            .on_message(message, 'Sensor', 'motion')

        assert subject.state == DeviceStatus.OFF

        powerpi_mqtt_producer.assert_called_once_with(
            'geofence/MyGeofence/status',
            {'state': DeviceStatus.OFF}
        )

    @pytest.mark.asyncio
    async def test_on_message_old(
        self,
        subject: GeofenceSensor,
        powerpi_mqtt_producer: Mock,
        now: int
    ):
        await subject.initialise()

        message = {
            'state': 'detected',
            'timestamp': now - 2 * 60 * 1000
        }

        await self.consumers['event/Sensor/motion'] \
            .on_message(message, 'Sensor', 'motion')

        assert subject.state == DeviceStatus.UNKNOWN

        powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    async def test_on_message_condition_true(
        self,
        subject: GeofenceSensor,
        powerpi_variable_manager: Mock,
        powerpi_mqtt_producer: Mock,
        now: int,
        mocker: MockerFixture
    ):
        device = mocker.MagicMock()
        type(device).state = PropertyMock(return_value='off')

        presence = mocker.MagicMock()
        type(presence).state = PropertyMock(return_value='absent')

        sensor = mocker.MagicMock()
        type(sensor).state = PropertyMock(return_value='detected')

        powerpi_variable_manager.get_device = lambda _: device
        powerpi_variable_manager.get_presence = lambda _: presence
        powerpi_variable_manager.get_sensor = lambda *_: sensor

        await subject.initialise()

        message = {
            'state': 'detected',
            'timestamp': now
        }

        await self.consumers['event/Sensor/motion'] \
            .on_message(message, 'Sensor', 'motion')

        assert subject.state == DeviceStatus.ON

        powerpi_mqtt_producer.assert_called_once_with(
            'geofence/MyGeofence/status',
            {'state': DeviceStatus.ON}
        )

        # repeating the message doesn't rebroadcast
        await self.consumers['event/Sensor/motion'] \
            .on_message(message, 'Sensor', 'motion')

        powerpi_mqtt_producer.assert_called_once()

    @pytest.fixture
    def now(self):
        return int(
            datetime.now(timezone.utc).timestamp() * 1000
        )

    @pytest.fixture
    def mqtt_client(self, powerpi_mqtt_client):
        self.consumers: dict[str, MQTTConsumer] = {}

        def add_consumer(
            consumer: MQTTConsumer,
            priority: MQTTConsumerPriority
        ):
            if consumer.topic in self.consumers:
                raise KeyError('Repeated consumer')

            self.consumers[consumer.topic] = consumer

            assert priority == MQTTConsumerPriority.LOGIC

        powerpi_mqtt_client.add_consumer = add_consumer

        return powerpi_mqtt_client

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        mqtt_client,
        powerpi_variable_manager
    ):
        return GeofenceSensor(
            config=powerpi_config,
            logger=powerpi_logger,
            mqtt_client=mqtt_client,
            variable_manager=powerpi_variable_manager,
            name='MyGeofence',
            condition={
                'when': [
                    {'equals': [{'var': 'presence.Presence.state'}, 'absent']},
                    {'equals': [{'var': 'presence.Presence.state'}, 'absent']},
                    {'equals': [{'var': 'device.Device.state'}, 'off']},
                    {'equals': [
                        {'var': 'sensor.Sensor.motion.state'},
                        'detected'
                    ]},
                ]
            }
        )
