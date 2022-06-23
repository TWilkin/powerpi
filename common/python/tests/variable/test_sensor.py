import pytest
from pytest_mock import MockerFixture

from powerpi_common.variable.sensor import SensorVariable
from powerpi_common_test.variable.variable import VariableTestBase


class TestSensorVariable(VariableTestBase):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()

        return SensorVariable(
            self.config, self.logger, self.mqtt_client,
            name='TestSensor',
            action='detect'
        )

    def test_topic(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.topic == 'event/TestSensor/detect'

    async def test_on_message_updates(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        message = {'value': 12.34, 'unit': 'doughnuts'}

        assert subject.value == (None, None)

        await subject.on_message(message, 'TestSensor', 'detect')

        assert subject.value == (12.34, 'doughnuts')

    @pytest.mark.parametrize('which', ['value', 'unit'])
    async def test_on_message_ignores(self, mocker: MockerFixture, which: str):
        subject = self.create_subject(mocker)

        message = {'value': 12.34, 'unit': 'doughnuts'}
        message[which] = None

        assert subject.value == (None, None)

        await subject.on_message(message, 'TestSensor', 'detect')

        assert subject.value == (None, None)
