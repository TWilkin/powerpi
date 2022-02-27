import socket

from lifxlan import Light
from typing import Union

from powerpi_common.logger import Logger
from lifx_controller.device.lifx_colour import LIFXColour


class LIFXClient(object):
    def __init__(self, logger: Logger):
        self.__logger = logger

        self.__light = None
        self.__supports_colour: Union[bool, None] = None
        self.__supports_temperature: Union[bool, None] = None

    @property
    def address(self):
        return self.__address

    @address.setter
    def address(self, new_address: str):
        self.__address = new_address

    @property
    def mac_address(self):
        return self.__mac_address

    @mac_address.setter
    def mac_address(self, new_mac_address: str):
        self.__mac_address = new_mac_address
    
    @property
    def supports_colour(self):
        return self.__supports_colour
    
    @property
    def supports_temperature(self):
        return self.__supports_temperature

    def connect(self):
        if self.__light is None:
            self.__light = Light(
                self.__mac_address,
                self.__address,
                source_id=self.__find_free_port()
            )

        if self.__supports_colour is None:
            self.__supports_colour = self.__light.supports_color()
        
        if self.__supports_temperature is None:
            self.__supports_temperature = self.__light.supports_temperature()

    def get_power(self):
        self.connect()
        return self.__light.get_power()

    def set_power(self, on: bool, duration: int):
        self.connect()
        self.__light.set_power(on, duration)
    
    def get_colour(self):
        self.connect()
        return LIFXColour(self.__light.get_color())
    
    def set_colour(self, colour: LIFXColour, duration: int):
        self.connect()
        self.__light.set_color(colour.list, duration)

    def __find_free_port(self):
        connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        connection.bind(('', 0))
        _, port = connection.getsockname()
        connection.close()
        return port
