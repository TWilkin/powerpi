import time

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager
from powerpi_common.mqtt import MQTTClient


class SocketDevice(Device):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name, home_id=0, device_id=0, retries=4, delay=0.5,
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__retries = retries
        self.__delay = delay

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass

    def _run(self, func, new_state, *params):
        for _ in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)


class SocketGroupDevice(Device):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        name, devices, home_id=None, retries=4, delay=0.5
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__device_manager = device_manager
        self.__devices = devices
        self.__retries = retries
        self.__delay = delay

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass

    def _run(self, func, new_state, *params):
        for _ in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        for device in self.__devices:
            self.__device_manager.get_device(device).state = new_state
