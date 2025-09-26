import os

import zigpy
from powerpi_common.logger import Logger, LogMixin
from zigpy.types import EUI64
from zigpy.typing import DeviceType
from zigpy_znp.zigbee.application import ControllerApplication

from zigbee_controller.config import ZigbeeConfig


class ZigbeeController(LogMixin):
    def __init__(self, config: ZigbeeConfig, logger: Logger):
        self.__config = config
        self._logger = logger

        self._logger.add_logger(zigpy.__name__)

        self.__controller: ControllerApplication | None = None

    def get_device(self, ieee: EUI64, nwk: int) -> DeviceType:
        return self.__controller.get_device(ieee, nwk)

    async def startup(self):
        config = {
            'database_path': self.__config.database_path,
            'device': {
                'path': self.__config.zigbee_device,
                'baudrate': self.__config.baudrate,
                'flow_control': self.__config.flow_control,
            }
        }

        # pylint: disable=broad-except,protected-access
        try:
            self.__controller = await ControllerApplication.new(config, auto_form=True)
        except Exception as ex:
            self.log_error('Could not initialise ZigBee device')
            self.log_exception(ex)
            os._exit(-1)

    async def shutdown(self):
        self.log_info('Shutting down ZigBee device')
        await self.__controller.shutdown()

    async def pair(self, time: int):
        await self.__controller.permit(time)

    def add_listener(self, listener):
        self.__controller.add_listener(listener)
