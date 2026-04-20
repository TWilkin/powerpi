import pytest
from powerpi_common_test.variable.variable import VariableTestBase

from powerpi_common.device import DeviceStatus
from powerpi_common.variable.geofence import GeofenceVariable


class TestGeofenceVariable(VariableTestBase):

    def test_topic(self, subject: GeofenceVariable):
        assert subject.topic == 'geofence/TestGeofence/status'

    def test_variable_type(self, subject: GeofenceVariable):
        assert subject.variable_type == 'geofence'

    @pytest.mark.asyncio
    async def test_on_message_updates(self, subject: GeofenceVariable):
        message = {'state': DeviceStatus.OFF}

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.on_message(message, 'TestGeofence', 'status')

        assert subject.state == DeviceStatus.OFF

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return GeofenceVariable(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='TestGeofence'
        )
