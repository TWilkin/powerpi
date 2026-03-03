import os

import zigpy
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.device import DeviceManager
from zigpy.application import ControllerApplication
from zigpy.device import Device as ZigPyDevice
from zigpy.types import EUI64

from zigbee_controller.config import ZigbeeConfig
from .library import ZigbeeLibraryFactory, ZigbeeLibrary
from .zigbee_listener import ConnectionLostListener


class ZigbeeController(LogMixin):
    def __init__(
        self,
        config: ZigbeeConfig,
        logger: Logger,
        library_factory: ZigbeeLibraryFactory,
        device_manager: DeviceManager
    ):
        self.__config = config
        self._logger = logger
        self.__library_factory = library_factory
        self.__device_manager = device_manager

        self._logger.add_logger(zigpy.__name__)

        self.__controller: ControllerApplication | None = None
        self.__library: ZigbeeLibrary

    @property
    def controller_application(self) -> ControllerApplication:
        return self.__controller

    def get_device(self, ieee: EUI64, nwk: int) -> ZigPyDevice:
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
            self.__library: ZigbeeLibrary = self.__library_factory().get_library()
            app_type = self.__library.get_application()
            controller: ControllerApplication = await app_type.new(config, auto_form=True)

            self.__controller = controller

            self.__controller.add_listener(
                ConnectionLostListener(self.__connection_lost))

            await self.__register_default_groups()

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

    def purge_unknown_devices(self):
        self.log_info('Purging unknown devices')

        expected_devices = [
            device.ieee for device in self.__device_manager.devices_and_sensors
            if hasattr(device, 'ieee')
        ]

        registered_devices = list(self.__controller.devices.keys())

        for ieee in registered_devices:
            self.log_debug(f'Checking device {ieee}')

            if ieee == self.__controller.state.node_info.ieee:
                # ignore the coordinator
                continue

            if ieee not in expected_devices:
                self.log_info(f'Removing unexpected device {ieee}')
                self.__controller.devices.pop(ieee, None)

    def _ensure_controller_running(self):
        if not self.__controller:
            raise ZigbeeControllerNotRunningError()

    def __connection_lost(self, _: Exception):
        self.log_error('ZigBee connection lost, shutting down')
        os._exit(-1)

    async def __register_default_groups(self):
        # we register with groups for sleepy devices
        self.log_info('Joining groups')

        for group_id in [0xFF09]:
            await self.__library.register_group(self.__controller, group_id)


class ZigbeeControllerNotRunningError(RuntimeError):
    def __init__(self):
        super().__init__('ZigBee controller is not running')
