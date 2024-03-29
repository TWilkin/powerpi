import asyncio
from typing import Awaitable

import aioharmony
import asyncio_atexit
from aioharmony.harmonyapi import HarmonyAPI
from powerpi_common.logger import Logger


class HarmonyClient:
    def __init__(self, logger: Logger):
        self.__logger = logger
        self.__logger.add_logger(aioharmony.harmonyapi.__name__)

        self.__client: HarmonyAPI | None = None

    @property
    def is_connected(self):
        return self.__client is not None

    @ property
    def address(self):
        return self.__address

    @ address.setter
    def address(self, new_address: setattr):
        self.__address = new_address

    async def get_config(self):
        await self.connect(get_config=False)

        await self.__client._harmony_client.refresh_info_from_hub()

        return self.__client.config

    async def get_current_activity(self):
        await self.connect()

        current_activity_id, _ = self.__client.current_activity

        return current_activity_id

    async def start_activity(self, activity_name: str):
        async def func():
            await self.__client.start_activity(activity_name)

        await self.__reconnect_and_run(func)

    async def power_off(self):
        async def func():
            await self.__client.power_off()

        await self.__reconnect_and_run(func)

    async def connect(self, reconnect=False, get_config=True):
        if reconnect or not self.is_connected:
            asyncio_atexit.unregister(self.disconnect)
            asyncio_atexit.register(self.disconnect)

            self.__logger.info(f'Connecting to hub at "{self}"')

            self.__client = HarmonyAPI(self.__address)

            connected = await self.__client.connect()

            if connected is False:
                self.__client = None

                raise ConnectionError(
                    f'Failed to connect to hub at "{self}"'
                )

            if get_config:
                await self.__client._harmony_client.refresh_info_from_hub()

    async def disconnect(self):
        if self.is_connected:
            self.__logger.info(f'Disconnecting from hub at "{self}"')

            await self.__client.close()

            self.__client = None

    async def __reconnect_and_run(self, func: Awaitable, retries=2):
        first = True

        for retry in range(0, retries):
            # pylint: disable=broad-except
            try:
                await self.connect(not first)

                return await func()
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
        return f'harmony://{self.__address}'
