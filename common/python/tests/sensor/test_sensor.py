from typing import Union

from pytest_mock import MockerFixture

from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common_test.mqtt import mock_producer
from powerpi_common_test.sensor import SensorTestBase


class SensorImpl(Sensor):
    def __init__(
        self,
        mqtt_client: MQTTClient,
        entity: Union[str, None],
        action: Union[str, None],
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, entity, action, **kwargs)


class TestSensor(SensorTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.publish = mock_producer(mocker, self.mqtt_client)

        self.entity = getattr(self, 'entity', None)
        self.action = getattr(self, 'action', None)

        return SensorImpl(
            self.mqtt_client, self.entity, self.action,
            name='TestSensor'
        )

    def test_broadcast_entity(self, mocker: MockerFixture):
        self.__broadcast(
            mocker,
            'event/Entity/Action',
            entity='Entity', action='Action'
        )

    def test_broadcast_name(self, mocker: MockerFixture):
        self.__broadcast(mocker, 'event/TestSensor/Action', action='Action')

    def test_broadcast_action(self, mocker: MockerFixture):
        self.__broadcast(
            mocker, 'event/Entity/ActionParam',
            entity='Entity', action='Action', action_param='ActionParam'
        )

    def __broadcast(
        self,
        mocker: MockerFixture,
        topic: str,
        entity: Union[str, None] = None,
        action: Union[str, None] = None,
        action_param: Union[str, None] = None
    ):
        self.entity = entity
        self.action = action

        subject = self.create_subject(mocker)

        message = {'test': 'me'}
        subject._broadcast(action_param, message)

        self.publish.assert_called_once_with(topic, message)
