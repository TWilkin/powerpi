from unittest.mock import patch

from pytest_mock import MockerFixture

from powerpi_common.device import DeviceConfigType, DeviceNotFoundException
from powerpi_common.event import EventManager
from powerpi_common_test.base import BaseTest


class TestEventManager(BaseTest):
    def create_subject(self, mocker: MockerFixture):
        #pylint: disable=attribute-defined-outside-init
        self.config = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.variable_manager = mocker.Mock()

        return EventManager(
            self.config,
            mocker.Mock(),
            self.mqtt_client,
            self.device_manager,
            self.variable_manager
        )

    def test_load_no_content(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        self.config.events = {
            'listeners': []
        }

        subject.load()

        self.mqtt_client.add_consumer.assert_not_called()

    def test_load_content(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        self.config.events = {
            'listeners': [
                {
                    'topic': 'Sensor/Action',
                    'events': [
                        {
                            'action': {'device': 'Device', 'state': 'off'},
                            'condition': 'condition1'
                        },
                        {
                            'action': {'device': 'MissingDevice', 'state': 'on'},
                            'condition': 'condition3'
                        },
                        {
                            'action': {'device': 'RemoteDevice', 'state': 'on'},
                            'condition': 'condition4'
                        },
                        {
                            'action': {'device': 'Device', 'state': 'impossible'},
                            'condition': 'condition5'
                        }
                    ]
                }, {
                    'topic': 'Something/Else',
                    'events': [
                        {
                            'action': {'device': 'Device', 'state': 'on'},
                            'condition': 'condition6'
                        }
                    ]
                }, {
                    'topic': 'Sensor/Action',
                    'events': [
                        {
                            'action': {'device': 'Device2', 'state': 'on'},
                            'condition': 'condition2'
                        }
                    ]
                }, {
                    'topic': 'Ignore/Me',
                    'events': []
                }
            ]
        }

        with patch('powerpi_common.event.manager.issubclass', lambda t, _: t == str):
            def get_device(name: str):
                if name in ('Device', 'Device2'):
                    return name
                if name == 'RemoteDevice':
                    return False

                raise DeviceNotFoundException(DeviceConfigType.DEVICE, name)

            self.device_manager.get_device = get_device

            subject.load()

        # we're expecting 2 consumers
        assert len(subject.consumers) == 2

        # we're expecting the fist consumer to have 2 events
        assert len(subject.consumers[0].events) == 2
        assert subject.consumers[0].topic == 'event/Sensor/Action'

        assert subject.consumers[0].events[0].device == 'Device'
        assert subject.consumers[0].events[0].condition == 'condition1'

        assert subject.consumers[0].events[1].device == 'Device2'
        assert subject.consumers[0].events[1].condition == 'condition2'

        # we're expecting the second consumer to have 1 events
        assert len(subject.consumers[1].events) == 1
        assert subject.consumers[1].topic == 'event/Something/Else'

        assert subject.consumers[1].events[0].device == 'Device'
        assert subject.consumers[1].events[0].condition == 'condition6'
