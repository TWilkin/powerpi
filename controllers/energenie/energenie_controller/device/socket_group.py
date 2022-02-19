from asyncio import sleep
from typing import Callable, List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager
from powerpi_common.mqtt import MQTTClient
from energenie_controller.energenie import EnergenieInterface


class SocketGroupDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        energenie: EnergenieInterface,
        devices: List[str],
        home_id=0,  # for ENER314
        retries=2,
        delay=0.2,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__device_manager = device_manager
        self.__energenie = energenie
        self.__devices = devices
        self.__retries = retries
        self.__delay = delay

        self.__energenie.set_ids(home_id, 0)
    
    def _poll(self):
        pass

    async def _turn_on(self):
        await self._run(self.__energenie.turn_on, 'on')

    async def _turn_off(self):
        await self._run(self.__energenie.turn_off, 'off')

    async def _run(self, func: Callable, new_state: str):
        for _ in range(0, self.__retries):
            func()
            await sleep(self.__delay)

        for device in self.__devices:
            self.__device_manager.get_device(device).state = new_state
