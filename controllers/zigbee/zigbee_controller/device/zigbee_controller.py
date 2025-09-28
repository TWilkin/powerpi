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
        self._ensure_controller_running()

        return self.__controller.get_device(ieee, nwk)

    async def startup(self):
        config = {
            'database_path': self.__config.database_path,
            'device': {
                'path': self.__config.zigbee_device,
            },
        }

        if self.__config.baudrate:
            config['device']['baudrate'] = self.__config.baudrate
        if self.__config.flow_control:
            config['device']['flow_control'] = self.__config.flow_control

        try:
            app_type = self.__library_factory().get_library()
            controller: ControllerApplication = await app_type.new(config, auto_form=True)

            self.__controller = controller

            self.log_info('ZigBee controller started')
        except Exception as ex:
            self.log_error('Could not initialise ZigBee controller')
            self.log_exception(ex)
            os._exit(-1)

    async def shutdown(self):
        self.log_info('Shutting down ZigBee controller')
        if self.__controller:
            await self.__controller.shutdown()
            self.__controller = None

    async def pair(self, time: int):
        self._ensure_controller_running()

        await self.__controller.permit(time)

    def add_listener(self, listener):
        self._ensure_controller_running()

        self.__controller.add_listener(listener)

    def _ensure_controller_running(self):
        if not self.__controller:
            raise ZigbeeControllerNotRunningError()


class ZigbeeControllerNotRunningError(RuntimeError):
    def __init__(self):
        super().__init__('ZigBee controller is not running')
