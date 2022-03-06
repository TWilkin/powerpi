from asyncio import sleep
from typing import Callable, List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin
from powerpi_common.mqtt import MQTTClient
from energenie_controller.energenie import EnergenieInterface


class SocketGroupDevice(Device, DeviceOrchestratorMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        energenie: EnergenieInterface,
        devices: List[str],
        home_id=0, # for ENER314
        retries=2,
        delay=0.2,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        DeviceOrchestratorMixin.__init__(self, config, logger, mqtt_client, device_manager, devices)

        self.__energenie = energenie
        self.__retries = retries
        self.__delay = delay

        self.__energenie.set_ids(home_id, 0)
    
    def on_referenced_device_status(self, _: str, state: DeviceStatus):
        any_on = False
        any_unknown = False

        for device in self.devices:
            if device.state == DeviceStatus.ON:
                any_on = True
            elif device.state == DeviceStatus.UNKNOWN:
                any_unknown = True
        
        if any_unknown:
            self.set_new_state(DeviceStatus.UNKNOWN)
        elif any_on:
            self.set_new_state(DeviceStatus.ON)
        else:
            self.set_new_state(DeviceStatus.OFF)

    async def _turn_on(self):
        await self._run(self.__energenie.turn_on, DeviceStatus.ON)

    async def _turn_off(self):
        await self._run(self.__energenie.turn_off, DeviceStatus.OFF)

    async def _run(self, func: Callable, new_state: DeviceStatus):
        for _ in range(0, self.__retries):
            func()
            await sleep(self.__delay)

        for device in self.devices:
            if device.state != new_state:
                device.state = new_state
