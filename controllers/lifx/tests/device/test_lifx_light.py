from asyncio import Future
from typing import Tuple, Union
from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.util.data import Range
from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import (InitialisableMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture

from lifx_controller.device.lifx_client import LIFXClient
from lifx_controller.device.lifx_colour import LIFXColour
from lifx_controller.device.lifx_light import LIFXLightDevice


class TestLIFXLightDevice(
    AdditionalStateDeviceTestBase,
    PollableMixinTestBase,
    InitialisableMixinTestBase
):
    @pytest.mark.asyncio
    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    async def test_initialise_gets_capabilities(
        self,
        subject: LIFXLightDevice,
        lifx_client: LIFXClient,
        supports_colour: bool,
        supports_temperature: bool
    ):
        # pylint: disable=protected-access, simplifiable-if-expression

        self.__mock_supports(
            lifx_client, supports_colour, supports_temperature
        )

        await subject.initialise()

        assert subject.supports_brightness is True
        assert subject.supports_colour_hue_and_saturation is \
            (True if supports_colour is True else False)

        if supports_temperature:
            assert subject.supports_colour_temperature.min == 1000
            assert subject.supports_colour_temperature.max == 2000
        else:
            assert subject.supports_colour_temperature is False

        keys = subject._additional_state_keys()
        assert 'brightness' in keys
        assert ('temperature' in keys) is \
            (True if supports_temperature is True else False)
        assert ('hue' in keys) is (True if supports_colour is True else False)
        assert ('saturation' in keys) is \
            (True if supports_colour is True else False)

    @pytest.mark.asyncio
    @pytest.mark.parametrize('powered', [None, 1, 0])
    @pytest.mark.parametrize('colour', [None, (65535, 65535, 65535, 4000)])
    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    async def test_poll(
        self,
        subject: LIFXLightDevice,
        lifx_client: LIFXClient,
        mocker: MockerFixture,
        powered: bool,
        colour: Tuple[int, int, int, int],
        supports_colour: bool,
        supports_temperature: bool
    ):
        # pylint: disable=too-many-arguments

        self.__mock_supports(
            lifx_client, supports_colour, supports_temperature
        )

        future = Future()
        future.set_result((
            powered,
            None if colour is None else LIFXColour(colour)
        ))
        mocker.patch.object(
            lifx_client,
            'get_state',
            return_value=future
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

        if supports_colour is True and colour is not None:
            assert subject.additional_state.get('hue', None) == 360
            assert subject.additional_state.get('saturation', None) \
                == 100
        else:
            assert subject.additional_state.get('hue', None) is None
            assert subject.additional_state.get('saturation', None) is None

        if colour is not None:
            assert subject.additional_state.get('brightness', None) \
                == 100
        else:
            assert subject.additional_state.get('brightness', None) is None

        if supports_temperature is True and colour is not None:
            assert subject.additional_state.get('temperature', None) \
                == 4000
        else:
            assert subject.additional_state.get('temperature', None) is None

    @pytest.mark.asyncio
    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    async def test_poll_no_change(
        self,
        subject: LIFXLightDevice,
        lifx_client: LIFXClient,
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture,
        supports_colour: bool,
        supports_temperature: bool
    ):
        # pylint: disable=too-many-arguments

        self.__mock_supports(
            lifx_client, supports_colour, supports_temperature
        )

        future = Future()
        future.set_result((False, LIFXColour((65535, 65535, 65535, 4000))))
        mocker.patch.object(
            lifx_client,
            'get_state',
            return_value=future
        )

        assert subject.state == 'unknown'
        assert subject.additional_state == {}

        await subject.poll()
        await subject.poll()

        topic = 'device/light/status'
        message = {
            'state': 'off',
            'brightness': 100
        }
        if supports_colour:
            message['hue'] = 360
            message['saturation'] = 100
        if supports_temperature:
            message['temperature'] = 4000

        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        lifx_client
    ):
        return LIFXLightDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, lifx_client,
            '00:00:00:00:00', 'mylight.home',
            name='light', poll_frequency=120
        )

    def __mock_supports(
        self,
        lifx_client: LIFXClient,
        colour: Union[bool, None],
        temperature: Union[bool, None]
    ):
        type(lifx_client).supports_colour = PropertyMock(
            return_value=colour
        )

        type(lifx_client).supports_temperature = PropertyMock(
            return_value=temperature
        )

        if temperature:
            type(lifx_client).colour_temperature_range = PropertyMock(
                return_value=Range(1000, 2000)
            )
