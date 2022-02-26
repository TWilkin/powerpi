import socket

from lifxlan import Light, WorkflowException
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
        def func():
            return self.__light.get_power()

        return self.__error_handling(func)

    def set_power(self, on: bool, duration: int):
        def func(on: bool, duration: int):
            self.__light.set_power(on, duration)

        self.__error_handling(func, on, duration)
    
    def get_colour(self):
        def func():
            return LIFXColour(self.__light.get_color())
        
        return self.__error_handling(func)
    
    def set_colour(self, colour: LIFXColour, duration: int):
        def func(colour: LIFXColour, duration: int):
            self.__light.set_color(colour.list, duration)
        
        self.__error_handling(func, colour, duration)

    def __error_handling(self, func, *args):
        if self.__light is None:
            self.connect()

        try:
            return func(*args)
        except WorkflowException as e:
            self.__logger.error(e)

        return None

    def __find_free_port(self):
        connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        connection.bind(('', 0))
        _, port = connection.getsockname()
        connection.close()
        return port
