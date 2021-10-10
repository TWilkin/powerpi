import time

from powerpi_common.config import Config
from powerpi_common.device import ThreadedDevice
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class DelayDevice(ThreadedDevice):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        start: float = 5,
        end: float = 5,
        **kwargs
    ):
        ThreadedDevice.__init__(self, config, logger,
                                mqtt_client, name, **kwargs)

        self.__start = start
        self.__end = end

    def poll(self):
        pass

    def _turn_on(self):
        self.__delay(self.__start)

    def _turn_off(self):
        self.__delay(self.__end)

    def __delay(self, delay: int):
        self._logger.debug(f'{self.name}: Delay of {delay}s starting')
        time.sleep(delay)
        self._logger.debug(f'{self.name}: Delay of {delay}s complete')
