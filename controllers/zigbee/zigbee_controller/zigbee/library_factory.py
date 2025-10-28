from powerpi_common.logger import Logger, LogMixin
from zigpy.application import ControllerApplication

from zigbee_controller.config import ZigbeeConfig


class ZigbeeLibraryFactory(LogMixin):
    '''Factory to get the appropriate ZigBee library based on configuration.'''

    def __init__(self, config: ZigbeeConfig, logger: Logger):
        self.__config = config
        self._logger = logger

    def get_library(self) -> type[ControllerApplication]:
        library_name = self.__config.zigbee_library.lower()

        if library_name == 'znp':
            self.log_info('Using ZNP ZigBee library')
            from zigpy_znp.zigbee.application import ControllerApplication as ZNPControllerApplication
            return ZNPControllerApplication

        if library_name == 'bellows':
            self.log_info('Using Bellows ZigBee library')
            from bellows.zigbee.application import ControllerApplication as BellowsControllerApplication
            return BellowsControllerApplication

        raise ValueError(f'Unsupported ZigBee library: {library_name}')
