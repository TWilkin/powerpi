from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.mqtt import MQTTClient


class TestDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        message: str
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__message = message

    def poll(self):
        pass

    def _turn_on(self):
        self._logger.info(f'{self}: on: {self.__message}')

    def turn_off(self):
        self._logger.info(f'{self}: off: {self.__message}')
