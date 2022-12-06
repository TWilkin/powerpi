from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class LogDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        message: str,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__message = message

    async def _turn_on(self):
        self.log_info(f'{self}: on: {self.__message}')

    async def _turn_off(self):
        self.log_info(f'{self}: off: {self.__message}')
