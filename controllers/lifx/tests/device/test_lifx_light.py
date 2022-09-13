from asyncio import Future
from typing import Tuple, Union
from unittest.mock import PropertyMock

import pytest
from lifx_controller.device.lifx_colour import LIFXColour
from lifx_controller.device.lifx_light import LIFXLightDevice
from powerpi_common_test.device import AdditionalStateDeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from powerpi_common_test.mqtt import mock_producer
from pytest_mock import MockerFixture


class TestLIFXLightDevice(AdditionalStateDeviceTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.lifx_client = mocker.Mock()

        future = Future()
        future.set_result((False, LIFXColour((0, 0, 0, 0))))
        mocker.patch.object(
            self.lifx_client,
            'get_state',
            return_value=future
        )

        future = Future()
        future.set_result(True)
        mocker.patch.object(
            self.lifx_client,
            'set_power',
            return_value=future
        )

        mocker.patch.object(
            self.lifx_client,
            'set_colour',
            return_value=future
        )

        return LIFXLightDevice(
            self.config, self.logger, self.mqtt_client, self.lifx_client,
            '00:00:00:00:00', 'mylight.home',
            name='light', poll_frequency=120
        )

    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    def test_supports(self, mocker: MockerFixture, supports_colour: bool, supports_temperature: bool):
        subject = self.create_subject(mocker)

        self.__mock_supports(supports_colour, supports_temperature)

        keys = subject._additional_state_keys()
        assert 'brightness' in keys
        assert ('temperature' in keys) is \
            (True if supports_temperature is True else False)
        assert ('hue' in keys) is (True if supports_colour is True else False)
        assert ('saturation' in keys) is (
            True if supports_colour is True else False)

    @pytest.mark.parametrize('powered', [None, 1, 0])
    @pytest.mark.parametrize('colour', [None, (1, 2, 3, 4)])
    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    # pylint: disable=too-many-arguments
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

        future = Future()
        future.set_result((
            powered,
            None if colour is None else LIFXColour(colour)
        ))
        mocker.patch.object(
            self.lifx_client,
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
            assert subject.additional_state.get('hue', None) == colour[0]
            assert subject.additional_state.get('saturation', None) \
                == colour[1]
        else:
            assert subject.additional_state.get('hue', None) is None
            assert subject.additional_state.get('saturation', None) is None

        if colour is not None:
            assert subject.additional_state.get('brightness', None) \
                == colour[2]
        else:
            assert subject.additional_state.get('brightness', None) is None

        if supports_temperature is True and colour is not None:
            assert subject.additional_state.get('temperature', None) \
                == colour[3]
        else:
            assert subject.additional_state.get('temperature', None) is None

    @pytest.mark.parametrize('supports_colour', [None, True, False])
    @pytest.mark.parametrize('supports_temperature', [None, True, False])
    async def test_poll_no_change(
        self,
        mocker: MockerFixture,
        supports_colour: bool,
        supports_temperature: bool
    ):
        def mock_publish():
            self.publish = mock_producer(mocker, self.mqtt_client)

        subject = self.create_subject(mocker, mock_publish)

        self.__mock_supports(supports_colour, supports_temperature)

        future = Future()
        future.set_result((False, LIFXColour((1, 2, 3, 4))))
        mocker.patch.object(
            self.lifx_client,
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
            'brightness': 3
        }
        if supports_colour:
            message['hue'] = 1
            message['saturation'] = 2
        if supports_temperature:
            message['temperature'] = 4

        self.publish.assert_called_once_with(topic, message)

    def __mock_supports(self, colour: Union[bool, None], temperature: Union[bool, None]):
        type(self.lifx_client).supports_colour = PropertyMock(
            return_value=colour
        )

        type(self.lifx_client).supports_temperature = PropertyMock(
            return_value=temperature
        )
