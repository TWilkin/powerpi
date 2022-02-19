from asyncio import sleep
from typing import Callable

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.mqtt import MQTTClient
from energenie_controller.energenie import EnergenieInterface


class SocketDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        energenie: EnergenieInterface,
        device_id=0,  # for individual socket in group,
        home_id=0,  # for ENER314
        retries=2,
        delay=0.2,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__energenie = energenie
        self.__retries = retries
        self.__delay = delay

        self.__energenie.set_ids(home_id, device_id)
    
    def _poll(self):
        pass

    async def _turn_on(self):
        await self._run(self.__energenie.turn_on)

    async def _turn_off(self):
        await self._run(self.__energenie.turn_off)

    async def _run(self, func: Callable):
        for _ in range(0, self.__retries):
            func()
            await sleep(self.__delay)
