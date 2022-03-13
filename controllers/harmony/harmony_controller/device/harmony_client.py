import asyncio
import atexit

from typing import Union

import pyharmony

from pyharmony.client import HarmonyClient as HarmonyClientLib, create_and_connect_client

from powerpi_common.logger import Logger


class HarmonyClient:
    def __init__(self, logger: Logger):
        self.__logger = logger
        self.__logger.add_logger(pyharmony.client.__name__)

        self.__client: Union[HarmonyClientLib, None] = None

        atexit.register(self.disconnect)

    @property
    def is_connected(self):
        return self.__client is not None

    @ property
    def address(self):
        return self.__address

    @ address.setter
    def address(self, new_address: setattr):
        self.__address = new_address

    @ property
    def port(self):
        return self.__port

    @ port.setter
    def port(self, new_port: int):
        self.__port = new_port

    async def get_config(self):
        def func():
            return self.__client.get_config()

        return await self.__reconnect_and_run(func)

    async def get_current_activity(self):
        def func():
            return self.__client.get_current_activity()

        return await self.__reconnect_and_run(func)

    async def start_activity(self, activity_name: str):
        def func():
            self.__client.start_activity(activity_name)

        await self.__reconnect_and_run(func)

    async def power_off(self):
        def func():
            self.__client.power_off()

        await self.__reconnect_and_run(func)

    def connect(self, reconnect=False):
        if reconnect or not self.is_connected:
            self.__logger.info(f'Connecting to hub at "{self}"')
            self.__client = create_and_connect_client(
                self.__address, self.__port
            )

            if self.__client is False:
                self.__client = None
                raise ConnectionError(
                    f'Failed to connect to hub at "{self}"'
                )

    def disconnect(self):
        if self.is_connected:
            self.__logger.info(f'Disconnecting from hub at "{self}"')
            self.__client.disconnect()
            self.__client = None

    async def __reconnect_and_run(self, func, retries=2):
        first = True

        for retry in range(0, retries):
            # pylint: disable=broad-except
            try:
                self.connect(not first)

                return func()
            except Exception as ex:
                first = False

                if retry == retries - 1:
                    self.__logger.error(
                        f'Failed to connect after retry {retries}, giving up.'
                    )
                    self.__logger.exception(ex)
                    raise ex

                # wait a little bit before retrying
                await asyncio.sleep(2)

    def __str__(self):
        return f'harmony://{self.__address}:{self.__port}'
