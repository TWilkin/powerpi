from asyncio import sleep

from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class DelayDevice(Device):
    #pylint: disable=too-many-arguments
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        start: float = 5,
        end: float = 5,
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )

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
