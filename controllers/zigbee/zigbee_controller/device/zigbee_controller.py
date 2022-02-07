import asyncio
import atexit

from zigpy.types import EUI64
from zigpy.typing import DeviceType
from zigpy_znp.zigbee.application import ControllerApplication

from powerpi_common.logger import Logger
from zigbee_controller.config import ZigbeeConfig


class ZigbeeController(object):
    def __init__(self, config: ZigbeeConfig, logger: Logger):
        self.__logger = logger

        config = {
            "device": {
                "path": config.zigbee_device
            }
        }

        self.__controller = ControllerApplication(config)
    
    def get_device(self, ieee: EUI64, nwk: int) -> DeviceType:
        return self.__controller.get_device(ieee, nwk)
    
    async def startup(self):
        self.__controller.add_listener(self)

        await self.__controller.startup(auto_form=True)

    async def shutdown(self):
        await self.__controller.shutdown()

    async def pair(self, time=60):
        await self.__controller.permit(time)
        await asyncio.sleep(time)

    def register(self, ieee: EUI64, network: int):
        device = self.__controller.add_device(ieee, network)

        loop = asyncio.get_event_loop()
        loop.create_task(device.initialize())
  
    atexit.register
    def __shutdown(self):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.shutdown())
