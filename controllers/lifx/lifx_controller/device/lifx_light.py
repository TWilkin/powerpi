import socket

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import ThreadedDevice
from powerpi_common.mqtt import MQTTClient
from lifx_controller.device.lifx_client import LIFXClient


class LIFXLightDevice(ThreadedDevice):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        lifx_client: LIFXClient,
        name: str,
        mac: str,
        ip: str = None,
        hostname: str = None,
        duration: int = 500,
        **kwargs
    ):
        ThreadedDevice.__init__(self, config, logger,
                                mqtt_client, name, **kwargs)

        self.__duration = duration

        self.__light = lifx_client
        lifx_client.mac_address = mac
        lifx_client.address = hostname if hostname is not None else ip

    def poll(self):
        is_powered = self.__light.get_power()

        if is_powered is not None:
            new_state = 'off' if is_powered == 0 else 'on'
            if new_state != self.state:
                self.state = new_state

    def _turn_on(self):
        self.__light.set_power(True, self.__duration)

    def _turn_off(self):
        self.__light.set_power(False, self.__duration)
