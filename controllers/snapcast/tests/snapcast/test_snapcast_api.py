from asyncio import Future
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from pytest_mock import MockerFixture

from snapcast_controller.snapcast.snapcast_api import SnapcastAPI


class TestSnapcastAPI:
    @pytest.mark.asyncio
    async def test_uri(self, subject: SnapcastAPI):
        await subject.connect('Snapcast.home', 1234)

        assert subject.uri == 'ws://Snapcast.home:1234/jsonrpc'

    @pytest.mark.asyncio
    async def test_connected(self, subject: SnapcastAPI, websocket: MagicMock):
        assert subject.connected is False

        type(websocket).connected = PropertyMock(return_value=False)
        await subject.connect('whatever', 1234)
        assert subject.connected is False

        type(websocket).connected = PropertyMock(return_value=True)
        assert subject.connected is True

    @pytest.fixture
    def subject(self, powerpi_logger):
        return SnapcastAPI(powerpi_logger)

    @pytest.fixture(autouse=True)
    def websocket(self, mocker: MockerFixture):
        future = Future()
        future.set_result(True)

        with patch('snapcast_controller.snapcast.snapcast_api.WebSocket') as constructor:
            socket = mocker.MagicMock()

            constructor.return_value = socket
            socket.ws_connect.return_value = future

            yield socket
