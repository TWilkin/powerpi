import pytest
from powerpi_common_test.variable.variable import VariableTestBaseNew

from powerpi_common.variable.sensor import SensorVariable


class TestSensorVariable(VariableTestBaseNew):

    def test_topic(self, subject: SensorVariable):
        assert subject.topic == 'event/TestSensor/detect'

    @pytest.mark.asyncio
    async def test_on_message_updates(self, subject: SensorVariable):
        message = {'value': 12.34, 'unit': 'doughnuts'}

        assert subject.value == (None, None)

        await subject.on_message(message, 'TestSensor', 'detect')

        assert subject.value == (12.34, 'doughnuts')

    @pytest.mark.asyncio
    @pytest.mark.parametrize('which', ['value', 'unit'])
    async def test_on_message_ignores(self, subject: SensorVariable, which: str):
        message = {'value': 12.34, 'unit': 'doughnuts'}
        message[which] = None

        assert subject.value == (None, None)

        await subject.on_message(message, 'TestSensor', 'detect')

        assert subject.value == (None, None)

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return SensorVariable(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='TestSensor',
            action='detect'
        )
