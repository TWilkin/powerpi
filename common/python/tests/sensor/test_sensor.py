import pytest
from powerpi_common_test.sensor import SensorTestBase

from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor


class SensorImpl(Sensor):
    def __init__(
        self,
        mqtt_client: MQTTClient,
        entity: str | None,
        action: str | None,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, entity, action, **kwargs)


class TestSensor(SensorTestBase):

    def test_broadcast_entity(self, subject_builder, powerpi_mqtt_producer):
        self.__broadcast(
            subject_builder,
            powerpi_mqtt_producer,
            'event/Entity/Action',
            entity='Entity',
            action='Action'
        )

    def test_broadcast_name(self, subject_builder, powerpi_mqtt_producer):
        self.__broadcast(
            subject_builder,
            powerpi_mqtt_producer,
            'event/TestSensor/Action',
            action='Action'
        )

    def test_broadcast_action(self, subject_builder, powerpi_mqtt_producer):
        self.__broadcast(
            subject_builder,
            powerpi_mqtt_producer,
            'event/Entity/ActionParam',
            entity='Entity',
            action='Action',
            action_param='ActionParam'
        )

    def __broadcast(
        self,
        subject_builder,
        powerpi_mqtt_producer,
        topic: str,
        entity: str | None = None,
        action: str | None = None,
        action_param: str | None = None
    ):
        # pylint: disable=too-many-arguments
        subject = subject_builder(entity, action)

        message = {'test': 'me'}

        # pylint: disable=protected-access
        subject._broadcast(action_param, message)

        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.fixture
    def subject_builder(self, powerpi_mqtt_client):
        def build(entity: str | None = None, action: str | None = None):
            return SensorImpl(
                powerpi_mqtt_client, entity, action,
                name='TestSensor'
            )

        return build

    @pytest.fixture
    def subject(self, subject_builder):
        return subject_builder()
