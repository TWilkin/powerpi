import pytest

from pytest_mock import MockerFixture

from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from lifx_controller.device.lifx_colour import LIFXColour
from lifx_controller.device.lifx_light import LIFXLightDevice


class TestLIFXLightDevice(AdditionalStateDeviceTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.lifx_client = mocker.Mock()

        mocker.patch.object(
            self.lifx_client,
            'get_colour',
            return_value=LIFXColour((0, 0, 0, 0))
        )

        return LIFXLightDevice(
            self.config, self.logger, self.mqtt_client, self.lifx_client, '00:00:00:00:00', 'mylight.home',
            name='light',
            colour=getattr(self, 'colour', False),
            temperature=getattr(self, 'temperature', False)
        )
    
    @pytest.mark.parametrize('colour', [True, False])
    @pytest.mark.parametrize('temperature', [True, False])
    def test_supports(self, mocker: MockerFixture, colour: bool, temperature: bool):
        self.colour = colour
        self.temperature = temperature
        subject = self.create_subject(mocker)

        keys = subject._additional_state_keys()
        assert 'brightness' in keys
        assert ('temperature' in keys) == temperature
        assert ('hue' in keys) == colour
        assert ('saturation' in keys) == colour
