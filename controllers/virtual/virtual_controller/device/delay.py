from asyncio import sleep

from powerpi_common.device import Device


class DelayDevice(Device):
    def __init__(
        self,
        start: float = 5,
        end: float = 5,
        **kwargs
    ):
        Device.__init__(self, **kwargs)

        self.__start = start
        self.__end = end

    async def _turn_on(self):
        await self.__delay(self.__start)

    async def _turn_off(self):
        await self.__delay(self.__end)

    async def __delay(self, delay: int):
        self._logger.debug(f'{self.name}: Delay of {delay}s starting')

        await sleep(delay)

        self._logger.debug(f'{self.name}: Delay of {delay}s complete')
