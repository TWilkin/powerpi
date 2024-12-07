import os

import zigpy
from powerpi_common.logger import Logger
from zigpy.types import EUI64
from zigpy.typing import DeviceType
from zigpy_znp.zigbee.application import ControllerApplication

from zigbee_controller.config import ZigbeeConfig


class ZigbeeController:
    def __init__(self, config: ZigbeeConfig, logger: Logger):
        self.__config = config
        self.__logger = logger

        self.__logger.add_logger(zigpy.__name__)

        self.__controller: ControllerApplication | None = None

    def get_device(self, ieee: EUI64, nwk: int) -> DeviceType:
        return self.__controller.get_device(ieee, nwk)

    async def startup(self):
        config = {
            'database_path': self.__config.database_path,
            'device': {
                'path': self.__config.zigbee_device
            }
        }

        # pylint: disable=broad-except,protected-access
        try:
            self.__controller = await ControllerApplication.new(config, auto_form=True)
        except Exception as ex:
            self.__logger.error('Could not initialise ZigBee device')
            self.__logger.exception(ex)
            os._exit(-1)

    async def shutdown(self):
        self.__logger.info('Shutting down ZigBee device')
        await self.__controller.shutdown()

    async def pair(self, time: int):
        await self.__controller.permit(time)

    def add_listener(self, listener):
        self.__controller.add_listener(listener)
