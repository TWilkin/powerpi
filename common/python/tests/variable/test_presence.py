import pytest
from powerpi_common_test.variable.variable import VariableTestBase

from powerpi_common.sensor import PresenceStatus
from powerpi_common.variable.presence import PresenceVariable


class TestPresenceVariable(VariableTestBase):

    def test_topic(self, subject: PresenceVariable):
        assert subject.topic == 'presence/TestPresence/status'

    @pytest.mark.asyncio
    async def test_on_message_updates(self, subject: PresenceVariable):
        message = {'state': 'absent'}

        assert subject.state is None

        await subject.on_message(message, 'TestPresence', 'status')

        assert subject.state == PresenceStatus.ABSENT

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return PresenceVariable(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='TestPresence'
        )
