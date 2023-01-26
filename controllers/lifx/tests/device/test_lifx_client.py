import asyncio
from typing import Callable, Tuple
from unittest.mock import MagicMock, PropertyMock

import pytest
from lifx_controller.device.lifx_client import LIFXClient
from lifx_controller.device.lifx_colour import LIFXColour
from powerpi_common.logger import Logger
from pytest_mock import MockerFixture


class TestLIFXClient:

    @pytest.mark.asyncio
    @pytest.mark.parametrize('data', [
        (1, True, True),
        (18, False, True),
        (51, False, False)
    ])
    async def test_connect(
        self,
        subject: LIFXClient,
        mock_light: MagicMock,
        mocker: MockerFixture,
        data: Tuple[int, bool, bool]
    ):
        product, supports_colour, supports_temperature = data

        def get_version(callb: Callable):
            mock_version = mocker.Mock()
            type(mock_version).product = PropertyMock(return_value=product)

            callb(None, mock_version)

        mock_light.return_value.get_version = get_version

        await subject.connect()

        mock_light.assert_called_once_with(
            asyncio.get_running_loop(), subject.mac_address, subject.address
        )

        assert subject.supports_colour is supports_colour
        assert subject.supports_temperature is supports_temperature

    @pytest.mark.asyncio
    async def test_get_state(self, subject: LIFXClient):
        result = await subject.get_state()

        assert result[0] is True

        assert result[1].hue == 1
        assert result[1].saturation == 2
        assert result[1].brightness == 3
        assert result[1].temperature == 4

    @pytest.mark.asyncio
    async def test_get_power(self, subject: LIFXClient):
        result = await subject.get_power()

        assert result is True

    @pytest.mark.asyncio
    async def test_get_colour(self, subject: LIFXClient):
        result = await subject.get_colour()

        assert result.hue == 1
        assert result.saturation == 2
        assert result.brightness == 3
        assert result.temperature == 4

    @pytest.mark.asyncio
    async def test_set_power(self, subject: LIFXClient, mock_light: MagicMock):
        def set_power(callb: Callable, value: bool, duration: int):
            assert value is True
            assert duration == 10

            callb(None, None)

        mock_light.return_value.set_power = set_power

        await subject.set_power(True, 10)

    @pytest.mark.asyncio
    @pytest.mark.parametrize('data', [
        (1, 3000, 3000),
        (1, 2000, 2500),
        (1, 10000, 9000),
        (51, 0, 0),
    ])
    async def test_set_colour(
        self,
        subject: LIFXClient,
        mock_light: MagicMock,
        mocker: MockerFixture,
        data: Tuple[int, int, int]
    ):
        product, actual_temperature, expected_temperature = data

        def get_version(callb: Callable):
            mock_version = mocker.Mock()
            type(mock_version).product = PropertyMock(return_value=product)

            callb(None, mock_version)

        mock_light.return_value.get_version = get_version

        def set_colour(callb: Callable, value: Tuple[int, int, int, int], duration: int):
            assert value[0] == 1
            assert value[1] == 2
            assert value[2] == 3
            assert value[3] == expected_temperature

            assert duration == 10

            callb(None, None)

        mock_light.return_value.set_color = set_colour

        await subject.set_colour(LIFXColour((1, 2, 3, actual_temperature)), 10)

    @pytest.fixture
    def subject(self, powerpi_logger: Logger):
        client = LIFXClient(powerpi_logger)
        client.address = '127.0.0.1'
        client.mac_address = 'AA:BB:CC:DD:EE:FF'

        return client

    @pytest.fixture
    def mock_light(self, mocker: MockerFixture):
        mock_connection = mocker.Mock()
        mock_connection.getsockname.return_value = ('127.0.0.1', 1337)

        mock_socket = mocker.patch('lifx_controller.device.lifx_client.socket')
        mock_socket.return_value.__enter__.return_value = mock_connection

        mock_light = mocker.patch('lifx_controller.device.lifx_client.Light')

        def get_version(callb: Callable):
            mock_version = mocker.Mock()
            type(mock_version).product = PropertyMock(return_value=1)

            callb(None, mock_version)

        mock_light.return_value.get_version = get_version

        return mock_light

    @pytest.fixture(autouse=True)
    def mock_colour(self, mock_light: MagicMock, mocker: MockerFixture):
        def get_colour(callb: Callable):
            mock_colour = mocker.Mock()
            type(mock_colour).power_level = PropertyMock(return_value=65535)
            type(mock_colour).color = PropertyMock(return_value=(1, 2, 3, 4))

            callb(None, mock_colour)

        mock_light.return_value.get_color = get_colour

        return mock_light
