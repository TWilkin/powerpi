import pytest

from pytest_mock import MockerFixture
from typing import Tuple, Union
from unittest.mock import PropertyMock

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
            name='light'
        )
    
    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    def test_supports(self, mocker: MockerFixture, supports_colour: bool, supports_temperature: bool):
        subject = self.create_subject(mocker)

        self.__mock_supports(supports_colour, supports_temperature)

        keys = subject._additional_state_keys()
        assert 'brightness' in keys
        assert ('temperature' in keys) == (supports_temperature == True)
        assert ('hue' in keys) == (supports_colour == True)
        assert ('saturation' in keys) == (supports_colour == True)
    
    @pytest.mark.parametrize('powered', [None, 1, 0])
    @pytest.mark.parametrize('colour', [None, (1, 2, 3, 4)])
    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    async def test_poll(
        self, 
        mocker: MockerFixture, 
        powered: bool, 
        colour: Tuple[int, int, int, int],
        supports_colour: bool, 
        supports_temperature: bool
    ):
        subject = self.create_subject(mocker)

        self.__mock_supports(supports_colour, supports_temperature)

        mocker.patch.object(
            self.lifx_client,
            'get_colour',
            return_value=None if colour is None else LIFXColour(colour)
        )

        mocker.patch.object(
            self.lifx_client,
            'get_power',
            return_value=powered
        )

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.poll()

        if powered is None:
            assert subject.state == 'unknown'
        elif powered:
            assert subject.state == 'on'
        else:
            assert subject.state == 'off'
        
        if (supports_colour == True) and colour is not None:
            assert subject.additional_state.get('hue', None) == colour[0]
            assert subject.additional_state.get('saturation', None) == colour[1]
        else:
            assert subject.additional_state.get('hue', None) is None
            assert subject.additional_state.get('saturation', None) is None
        
        if colour is not None:
            assert subject.additional_state.get('brightness', None) == colour[2]
        else:
            assert subject.additional_state.get('brightness', None) is None
        
        if (supports_temperature == True) and colour is not None:
            assert subject.additional_state.get('temperature', None) == colour[3]
        else:
            assert subject.additional_state.get('temperature', None) is None

    def __mock_supports(self, colour: Union[bool, None], temperature: Union[bool, None]):
        type(self.lifx_client).supports_colour = PropertyMock(return_value=colour)
        type(self.lifx_client).supports_temperature = PropertyMock(return_value=temperature)    
