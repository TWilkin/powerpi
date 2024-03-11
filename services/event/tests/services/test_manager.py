import pytest
from powerpi_common.device import DeviceNotFoundException
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.variable import VariableManager
from pytest_mock import MockerFixture

from event.config import EventConfig
from event.services.actions import ActionFactory
from event.services.manager import EventManager


class TestEventManager:
    def test_consumers(self, subject: EventManager):
        assert len(subject.consumers) == 0

    def test_load_no_content(
        self,
        subject: EventManager,
        powerpi_config: EventConfig,
        powerpi_mqtt_client: MQTTClient
    ):
        powerpi_config.events = {
            'listeners': []
        }

        subject.load()

        powerpi_mqtt_client.add_consumer.assert_not_called()

    def test_load_missing_device(
        self,
        subject: EventManager,
        powerpi_config: EventConfig,
        powerpi_mqtt_client: MQTTClient
    ):
        powerpi_config.devices = {
            'devices': [
                {'name': 'OtherDevice'}
            ]
        }

        powerpi_config.events = {
            'listeners': [
                {
                    'topic': 'No/Matter',
                    'events': [
                        {
                            'action': {'device': 'MissingDevice', 'state': 'on'},
                            'condition': 'condition'
                        }
                    ]
                }
            ]
        }

        with pytest.raises(DeviceNotFoundException) as ex:
            subject.load()

        assert ex.match('Cannot find device "MissingDevice')

        powerpi_mqtt_client.add_consumer.assert_not_called()

    def test_load(
        self,
        subject: EventManager,
        powerpi_config: EventConfig,
        powerpi_variable_manager: VariableManager
    ):
        powerpi_config.devices = {
            'devices': [
                {'name': 'Device1'},
                {'name': 'Device2'},
            ]
        }

        powerpi_config.events = {
            'listeners': [
                {
                    'topic': 'Sensor/Action',
                    'events': [
                        {
                            'action': {'device': 'Device1', 'state': 'off'},
                            'condition': 'condition1'
                        },
                        {
                            'action': {'device': 'Device2', 'state': 'impossible'},
                            'condition': 'condition2'
                        }
                    ]
                }, {
                    'topic': 'Something/Else',
                    'events': [
                        {
                            'action': {'device': 'Device1', 'state': 'on'},
                            'condition': 'condition3'
                        }
                    ]
                }, {
                    'topic': 'Sensor/Action',
                    'events': [
                        {
                            'action': {'device': 'Device2', 'state': 'on'},
                            'condition': 'condition4'
                        }
                    ]
                }, {
                    'topic': 'Ignore/Me',
                    'events': []
                }
            ]
        }

        powerpi_variable_manager.get_device = lambda device: device

        subject.load()

        # we're expecting 2 consumers
        assert len(subject.consumers) == 2

        # we're expecting the fist consumer to have 3 events
        assert len(subject.consumers[0].events) == 3
        assert subject.consumers[0].topic == 'event/Sensor/Action'

        assert subject.consumers[0].events[0].device == 'Device1'
        assert subject.consumers[0].events[0].condition == 'condition1'

        assert subject.consumers[0].events[1].device == 'Device2'
        assert subject.consumers[0].events[1].condition == 'condition2'

        assert subject.consumers[0].events[2].device == 'Device2'
        assert subject.consumers[0].events[2].condition == 'condition4'

        # we're expecting the second consumer to have 1 event
        assert len(subject.consumers[1].events) == 1
        assert subject.consumers[1].topic == 'event/Something/Else'

        assert subject.consumers[1].events[0].device == 'Device1'
        assert subject.consumers[1].events[0].condition == 'condition3'

    @pytest.fixture
    def action_factory(self, mocker: MockerFixture):
        return mocker.MagicMock()

    @pytest.fixture
    def subject(
        self,
        powerpi_config: EventConfig,
        powerpi_logger: Logger,
        powerpi_mqtt_client: MQTTClient,
        powerpi_variable_manager: VariableManager,
        action_factory: ActionFactory
    ):
        # pylint: disable=too-many-arguments
        return EventManager(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_variable_manager,
            action_factory
        )
