from jsonrpc_websocket import Server
from powerpi_common.logger import Logger, LogMixin

from snapcast_controller.device.typing import StatusResponse


class SnapcastAPI(LogMixin):
    '''
    Connection used to access a specific Snapcast server.
    '''

    def __init__(self, logger: Logger):
        self._logger = logger

        self.__host: str | None = None
        self.__port: int | None = None

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

    async def disconnect(self):
        await self.__server.close()

        self.log_info(f'Disconnected from {self.uri}')

    async def get_status(self):
        return StatusResponse.from_dict(await self.__server.Server.GetStatus())
