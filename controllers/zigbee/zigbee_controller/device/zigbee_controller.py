import asyncio
import atexit
import zigpy

from zigpy.types import EUI64
from zigpy.typing import DeviceType
from zigpy_znp.zigbee.application import ControllerApplication

from powerpi_common.logger import Logger
from zigbee_controller.config import ZigbeeConfig


class ZigbeeController(object):
    def __init__(self, config: ZigbeeConfig, logger: Logger):
        self.__config = config
        self.__logger = logger

        self.__logger.add_logger(zigpy.__name__)
    
    def get_device(self, ieee: EUI64, nwk: int) -> DeviceType:
        return self.__controller.get_device(ieee, nwk)
    
    async def startup(self):
        config = {
            "database_path": self.__config.database_path,
            "device": {
                "path": self.__config.zigbee_device
            }
        }

        self.__controller = await ControllerApplication.new(config, auto_form=True)

    async def shutdown(self):
        await self.__controller.shutdown()

    async def pair(self, time=60):
        await self.__controller.permit(time)
        await asyncio.sleep(time)
  
    atexit.register
    def __shutdown(self):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.shutdown())
