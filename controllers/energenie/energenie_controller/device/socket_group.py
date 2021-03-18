import time

from typing import List

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager
from powerpi_common.mqtt import MQTTClient
from .energenie import EnergenieInterface


class SocketGroupDevice(Device):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        energenie: EnergenieInterface,
        name: str,
        devices: List[str],
        home_id: int = None,
        retries=2,
        delay=0.2
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__device_manager = device_manager
        self.__energenie = energenie
        self.__devices = devices
        self.__retries = retries
        self.__delay = delay

        self.__energenie.home_id = home_id
        self.__energenie.device_id = 0

    def _turn_on(self):
        self._run(self.__energenie.turn_on, 'on')

    def _turn_off(self):
        self._run(self.__energenie.turn_off, 'off')

    def _run(self, func, new_state: str):
        for _ in range(0, self.__retries):
            func()
            time.sleep(self.__delay)

        for device in self.__devices:
            self.__device_manager.get_device(device).state = new_state
