import time

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.mqtt import MQTTClient


class SocketDevice(Device):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        home_id=0,
        device_id=0,
        retries=4,
        delay=0.5,
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__retries = retries
        self.__delay = delay

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass

    def _run(self, func, new_state: str, *params):
        for _ in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)
