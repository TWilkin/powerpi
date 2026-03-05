from powerpi_common.logger import Logger, LogMixin

from zigbee_controller.config import ZigbeeConfig
from .library import ZigbeeLibrary


class ZigbeeLibraryFactory(LogMixin):
    '''
    Factory to get the appropriate ZigBee library based on configuration.
    '''

    def __init__(self, config: ZigbeeConfig, logger: Logger):
        self.__config = config
        self._logger = logger

    def get_library(self) -> ZigbeeLibrary:
        library_name = self.__config.zigbee_library.lower()

        if library_name == 'znp':
            self.log_info('Using ZNP ZigBee library')
            from .znp import ZNPLibrary
            return ZNPLibrary()

        if library_name == 'bellows':
            self.log_info('Using Bellows ZigBee library')
            from .bellows import BellowsLibrary
            return BellowsLibrary()

        raise ValueError(f'Unsupported ZigBee library: {library_name}')
