import time

from collections.abc import Callable

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
        device_id: int,
        home_id=0,  # for ENER314
        retries=2,
        delay=0.2,
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__energenie = energenie
        self.__retries = retries
        self.__delay = delay

        self.__energenie.set_ids(home_id, device_id)

    def _turn_on(self):
        self._run(self.__energenie.turn_on)

    def _turn_off(self):
        self._run(self.__energenie.turn_off)

    def _run(self, func: Callable):
        for _ in range(0, self.__retries):
            func()
            time.sleep(self.__delay)
