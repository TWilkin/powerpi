from asyncio import sleep
from typing import Callable, List

from energenie_controller.energenie import EnergenieInterface
from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin
from powerpi_common.mqtt import MQTTClient


#pylint: disable=too-many-ancestors
class SocketGroupDevice(Device, DeviceOrchestratorMixin):
    #pylint: disable=too-many-arguments
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
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, devices
        )

        self.__energenie = energenie
        self.__retries = retries
        self.__delay = delay

        self.__energenie.set_ids(home_id, 0)

    async def on_referenced_device_status(self, _: str, state: DeviceStatus):
        # are any unknown
        if any((device.state == DeviceStatus.UNKNOWN for device in self.devices)):
            await self.set_new_state(DeviceStatus.UNKNOWN)
        # are any on
        elif any((device.state == DeviceStatus.ON for device in self.devices)):
            await self.set_new_state(DeviceStatus.ON)
        else:
            await self.set_new_state(DeviceStatus.OFF)

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
