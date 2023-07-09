import pytest
from powerpi_common_test.variable import VariableTestBase

from powerpi_common.device import DeviceStatus
from powerpi_common.device.scene_state import ReservedScenes
from powerpi_common.variable.device import DeviceVariable


class TestDeviceVariable(VariableTestBase):

    @pytest.mark.asyncio
    async def test_on_status_change(self, subject: DeviceVariable):
        assert subject.scene == ReservedScenes.DEFAULT
        assert subject.state == DeviceStatus.UNKNOWN
        assert subject.additional_state.get('brightness', None) is None

        message = {
            'scene': 'other',
            'state': 'on',
            'brightness': 33
        }
        await subject.on_message(message, subject.name, 'status')

        assert subject.scene == 'other'
        assert subject.state == DeviceStatus.ON
        assert subject.additional_state.get('brightness', None) == 33

    def test_get_additional_state_for_scene(self, subject: DeviceVariable):
        subject.additional_state = {'brightness': 20}

        result = subject.get_additional_state_for_scene(ReservedScenes.DEFAULT)
        assert result.get('brightness', None) == 20

        result = subject.get_additional_state_for_scene('other')
        assert result is None

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client):
        return DeviceVariable(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            name='TestVariable'
        )
