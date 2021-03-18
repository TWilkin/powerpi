import time

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.mqtt import MQTTClient
from .energenie import EnergenieInterface


class SocketDevice(Device):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        energenie: EnergenieInterface,
        name: str,
        home_id=0,
        device_id=0,
        retries=4,
        delay=0.5,
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__energenie = energenie
        self.__retries = retries
        self.__delay = delay

        self.__energenie.home_id = home_id
        self.__energenie.device_id = device_id

    def _turn_on(self):
        self._run(self.__energenie.turn_on, 'on')

    def _turn_off(self):
        self._run(self.__energenie.turn_off, 'off')

    def _run(self, func, new_state: str):
        for _ in range(0, self.__retries):
            func()
            time.sleep(self.__delay)
