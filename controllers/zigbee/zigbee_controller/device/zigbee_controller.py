import os
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

        try:
            self.__controller = await ControllerApplication.new(config, auto_form=True)
        except:
            self.__logger.error('Could not initialise ZigBee device')
            os._exit(-1)

    async def shutdown(self):
        self.__logger.info('Shutting down ZigBee device')
        await self.__controller.shutdown()

    async def pair(self, time: int):
        await self.__controller.permit(time)

    def add_listener(self, listener):
        self.__controller.add_listener(listener)
