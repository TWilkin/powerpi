from asyncio import Future
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from jsonrpc_websocket import TransportError
from pytest_mock import MockerFixture

from snapcast_controller.snapcast.listener import (SnapcastClientListener,
                                                   SnapcastGroupListener,
                                                   SnapcastServerListener)
from snapcast_controller.snapcast.snapcast_api import SnapcastAPI
from snapcast_controller.snapcast.typing import (Client, Group, Host, Server,
                                                 StatusResponse, Stream)

test_server = {
    'groups': [
        {
            'id': 'first',
            'muted': False,
            'name': 'something',
            'stream_id': 'stream',
            'clients': [
                {
                    'id': 'client',
                    'connected': True,
                    'host': {
                        'ip': '127.0.0.1',
                        'name': 'Client',
                        'mac': '00:00:00:00:00'
                    }
                }
            ]}
    ],
    'streams': [
        {'id': 'stream', 'status': 'playing'}
    ]
}


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

    @pytest.mark.asyncio
    async def test_connect(self, subject: SnapcastAPI, websocket: MagicMock):
        await subject.connect('whatever', 1234)

        websocket.ws_connect.assert_called_once()

    @pytest.mark.asyncio
    async def test_disconnect(self, subject: SnapcastAPI, websocket: MagicMock):
        await subject.connect('some.server', 1780)
        await subject.disconnect()

        websocket.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_add_remove_listener(
        self,
        subject: SnapcastAPI,
        server: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('another', 3)

        future = Future()
        future.set_result(True)

        listener = mocker.MagicMock(spec=SnapcastServerListener)
        listener.on_server_update.return_value = future

        subject.add_listener(listener)

        server.OnUpdate(test_server)

        listener.on_server_update.assert_called_once()

        subject.remove_listener(listener)
        listener.reset_mock()

        server.OnUpdate(test_server)
        listener.on_server_update.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_status(
        self,
        subject: SnapcastAPI,
        server: MagicMock
    ):
        status = {
            'server': test_server
        }
        future = Future()
        future.set_result(status)
        server.GetStatus.return_value = future

        await subject.connect('server.home', 1337)
        result = await subject.get_status()

        assert result is not None

        expected = StatusResponse(Server(
            [Group(
                'first',
                False,
                'something',
                'stream',
                [Client(
                    'client',
                    True,
                    Host('127.0.0.1', 'Client', '00:00:00:00:00')
                )]
            )],
            [Stream('stream', 'playing')]
        ))
        assert result == expected

    @pytest.mark.asyncio
    async def test_set_client_name(
        self,
        subject: SnapcastAPI,
        websocket: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('a.server', 1)
        await subject.set_client_name('client id', 'some client')

        assert websocket.Client.SetName.call_args_list == [mocker.call(
            id='client id',
            name='some client'
        )]

    @pytest.mark.asyncio
    async def test_group_stream(
        self,
        subject: SnapcastAPI,
        websocket: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('b.server', 1)
        await subject.set_group_stream('group 1', 'stream id')

        assert websocket.Group.SetStream.call_args_list == [mocker.call(
            id='group 1',
            stream_id='stream id'
        )]

    @pytest.mark.asyncio
    async def test_group_clients(
        self,
        subject: SnapcastAPI,
        websocket: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('a.server', 1)
        await subject.set_group_clients('group 2', ['client one', 'client two'])

        assert websocket.Group.SetClients.call_args_list == [mocker.call(
            id='group 2',
            clients=['client one', 'client two']
        )]

    @pytest.mark.asyncio
    async def test_reconnect(
        self,
        subject: SnapcastAPI,
        websocket: MagicMock,
        server: MagicMock
    ):
        server.GetStatus.side_effect = TransportError('oops')

        await subject.connect('something', 2)

        with pytest.raises(TransportError):
            await subject.get_status()

        assert websocket.Server.GetStatus.call_count == 2
        assert websocket.ws_connect.call_count == 2

    @pytest.mark.asyncio
    async def test_client_on_connect(
        self,
        subject: SnapcastAPI,
        client: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('another', 3)

        future = Future()
        future.set_result(True)

        listener = mocker.MagicMock(spec=SnapcastClientListener)
        listener.on_client_connect.return_value = future

        subject.add_listener(listener)

        client.OnConnect('id1', {
            'id': 'client',
            'connected': True,
            'host': {
                'ip': '127.0.0.1',
                'name': 'Client',
                'mac': '00:00:00:00:00'
            }
        })

        listener.on_client_connect.assert_called_once()

    @pytest.mark.asyncio
    async def test_client_on_disconnect(
        self,
        subject: SnapcastAPI,
        client: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('another', 3)

        future = Future()
        future.set_result(True)

        listener = mocker.MagicMock(spec=SnapcastClientListener)
        listener.on_client_disconnect.return_value = future

        subject.add_listener(listener)

        client.OnDisconnect('id1', {
            'id': 'client',
            'connected': True,
            'host': {
                'ip': '127.0.0.1',
                'name': 'Client',
                'mac': '00:00:00:00:00'
            }
        })

        listener.on_client_disconnect.assert_called_once()

    @pytest.mark.asyncio
    async def test_group_on_stream_change(
        self,
        subject: SnapcastAPI,
        group: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('another', 3)

        future = Future()
        future.set_result(True)

        listener = mocker.MagicMock(spec=SnapcastGroupListener)
        listener.on_group_stream_changed.return_value = future

        subject.add_listener(listener)

        group.OnStreamChanged('id3', 'new stream')

        assert listener.on_group_stream_changed.call_args_list == [mocker.call(
            stream_id='new stream'
        )]

    @pytest.mark.asyncio
    async def test_server_on_update(
        self,
        subject: SnapcastAPI,
        server: MagicMock,
        mocker: MockerFixture
    ):
        await subject.connect('another', 3)

        future = Future()
        future.set_result(True)

        listener = mocker.MagicMock(spec=SnapcastServerListener)
        listener.on_server_update.return_value = future

        subject.add_listener(listener)

        server.OnUpdate(test_server)

        listener.on_server_update.assert_called_once()

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
            socket.close.return_value = future

            yield socket

    @pytest.fixture
    def server(self, websocket: MagicMock, mocker: MockerFixture):
        future = Future()
        future.set_result(True)

        server = mocker.MagicMock()
        server.GetStatus.return_value = future
        type(websocket).Server = PropertyMock(return_value=server)

        return server

    @pytest.fixture(autouse=True)
    def client(self, websocket: MagicMock, mocker: MockerFixture):
        future = Future()
        future.set_result(True)

        client = mocker.MagicMock()
        client.SetName.return_value = future
        type(websocket).Client = PropertyMock(return_value=client)

        return client

    @pytest.fixture(autouse=True)
    def group(self, websocket: MagicMock, mocker: MockerFixture):
        future = Future()
        future.set_result(True)

        group = mocker.MagicMock()
        group.SetStream.return_value = future
        group.SetClients.return_value = future
        type(websocket).Group = PropertyMock(return_value=group)

        return group
