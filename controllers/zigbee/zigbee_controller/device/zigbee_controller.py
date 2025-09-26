import os

import zigpy
from powerpi_common.logger import Logger, LogMixin
from zigpy.application import ControllerApplication
from zigpy.types import EUI64
from zigpy.typing import DeviceType

from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.device.library_factory import ZigbeeLibraryFactory


class ZigbeeController(LogMixin):
    def __init__(self, config: ZigbeeConfig, logger: Logger, library_factory: ZigbeeLibraryFactory):
        self.__config = config
        self._logger = logger
        self.__library_factory = library_factory

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
            app_type = self.__library_factory().get_library()
            self.__controller = await app_type.new(config, auto_form=True)
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
