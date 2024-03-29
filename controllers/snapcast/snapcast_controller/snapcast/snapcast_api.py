from asyncio import create_task
from typing import Awaitable, List, Type

from jsonrpc_websocket import Server as WebSocket
from jsonrpc_websocket import TransportError
from powerpi_common.logger import Logger, LogMixin

from snapcast_controller.snapcast.listener import (SnapcastClientListener,
                                                   SnapcastGroupListener,
                                                   SnapcastListener,
                                                   SnapcastServerListener)
from snapcast_controller.snapcast.typing import Client, Server, StatusResponse


class SnapcastAPI(LogMixin):
    '''
    Connection used to access a specific Snapcast server.
    '''

    def __init__(self, logger: Logger):
        self._logger = logger

        self.__host: str | None = None
        self.__port: int | None = None

        self.__listeners: List[SnapcastListener] = []
        self.__server: WebSocket | None = None

    @property
    def uri(self):
        return f'ws://{self.__host}:{self.__port}/jsonrpc'

    @property
    def connected(self):
        return self.__server is not None and self.__server.connected

    async def connect(self, host: str, port: int):
        self.__host = host
        self.__port = port

        await self.__connect()

    async def disconnect(self):
        await self.__server.close()

        self.log_info(f'Disconnected from {self.uri}')

    def add_listener(self, listener: SnapcastListener):
        self.__listeners.append(listener)

    def remove_listener(self, listener: SnapcastListener):
        self.__listeners.remove(listener)

    async def get_status(self):
        async def func():
            status = await self.__server.Server.GetStatus()
            return StatusResponse.from_dict(status)

        return await self.__call_api(func)

    async def set_client_name(self, client_id: str, name: str):
        async def func():
            await self.__server.Client.SetName(id=client_id, name=name)

        await self.__call_api(func)

    async def set_group_stream(self, group_id: str, stream_id: str):
        async def func():
            await self.__server.Group.SetStream(id=group_id, stream_id=stream_id)

        await self.__call_api(func)

    async def set_group_clients(self, group_id: str, clients: List[str]):
        async def func():
            await self.__server.Group.SetClients(id=group_id, clients=clients)

        await self.__call_api(func)

    async def __connect(self):
        self.__server = WebSocket(self.uri)

        await self.__server.ws_connect()

        self.log_info(f'Connected to {self.uri}')

        self.__server.Client.OnConnect = lambda id, client: self.__broadcast(
            SnapcastClientListener, 'on_client_connect', client=Client.from_dict(client)
        )
        self.__server.Client.OnDisconnect = lambda id, client: self.__broadcast(
            SnapcastClientListener, 'on_client_disconnect', client=Client.from_dict(client)
        )

        self.__server.Group.OnStreamChanged = lambda id, stream_id: self.__broadcast(
            SnapcastGroupListener, 'on_group_stream_changed', stream_id=stream_id
        )

        self.__server.Server.OnUpdate = lambda server: self.__broadcast(
            SnapcastServerListener, 'on_server_update', server=Server.from_dict(server)
        )

    async def __call_api(self, func: Awaitable):
        try:
            return await func()
        except TransportError as error:
            self.log_error(error)

            await self.__connect()

            return await func()

    def __broadcast(self, listener_type: Type[SnapcastListener], func_name: str, **kwargs):
        for listener in self.__listeners:
            if isinstance(listener, listener_type):
                func = getattr(listener, func_name)
                create_task(func(**kwargs))
