from typing import List, Type

from jsonrpc_websocket import Server
from powerpi_common.logger import Logger, LogMixin

from snapcast_controller.snapcast.listener import (SnapcastClientListener,
                                                   SnapcastListener)
from snapcast_controller.snapcast.typing import StatusResponse


class SnapcastAPI(LogMixin):
    '''
    Connection used to access a specific Snapcast server.
    '''

    def __init__(self, logger: Logger):
        self._logger = logger

        self.__host: str | None = None
        self.__port: int | None = None

        self.__listeners: List[SnapcastListener] = []
        self.__server: Server | None = None

    @property
    def uri(self):
        return f'ws://{self.__host}:{self.__port}/jsonrpc'

    async def connect(self, host: str, port: int):
        self.__host = host
        self.__port = port

        self.__server = Server(self.uri)

        await self.__server.ws_connect()

        self.log_info(f'Connected to {self.uri}')

        self.__server.Client.OnConnect = lambda id, client: self.__broadcast(
            SnapcastClientListener, 'on_client_connect', client=client
        )
        self.__server.Client.OnDisconnect = lambda id, client: self.__broadcast(
            SnapcastClientListener, 'on_client_disconnect', client=client
        )

    async def disconnect(self):
        await self.__server.close()

        self.log_info(f'Disconnected from {self.uri}')

    def add_listener(self, listener: SnapcastListener):
        self.__listeners.append(listener)

    def remove_listener(self, listener: SnapcastListener):
        self.__listeners.remove(listener)

    async def get_status(self):
        return StatusResponse.from_dict(await self.__server.Server.GetStatus())

    def __broadcast(self, listener_type: Type[SnapcastListener], func_name: str, **kwargs):
        for listener in self.__listeners:
            if (isinstance(listener, listener_type)):
                func = getattr(listener, func_name)
                func(**kwargs)
