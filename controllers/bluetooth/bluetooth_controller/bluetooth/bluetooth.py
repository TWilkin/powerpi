from typing import Awaitable

from bleak import BleakClient


class BluetoothMixin:
    def __init__(
        self,
        mac: str,
        **_
    ):
        self.__mac = mac

    async def _connect_and_execute(self, func: Awaitable):
        async with BleakClient(self.__mac) as client:
            return await func(client)
