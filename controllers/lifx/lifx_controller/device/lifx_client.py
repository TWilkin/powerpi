import re
from asyncio import get_running_loop
from socket import AF_INET, SOCK_STREAM, gethostbyname, socket
from typing import Union

from aiolifx.aiolifx import Light
from lifx_controller.device.lifx_colour import LIFXColour


class LIFXClient:
    def __init__(self):
        self.__light = None
        self.__supports_colour: Union[bool, None] = None
        self.__supports_temperature: Union[bool, None] = None

    @property
    def address(self):
        return self.__address

    @address.setter
    def address(self, new_address: str):
        if re.search('[a-zA-Z]', new_address):
            # if it's not an IP address, get the IP address
            new_address = gethostbyname(new_address)

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
            loop = get_running_loop()

            self.__light = Light(
                loop,
                self.__mac_address,
                self.__address,
            )

            self.__light.source_id = self.__find_free_port()

            self.__light.task = loop.create_task(
                loop.create_datagram_endpoint(
                    lambda: self.__light, family=AF_INET, remote_addr=(self.__address, 56700)
                )
            )

        # if self.__supports_colour is None:
        #    self.__supports_colour = self.__light.supports_color()

        # if self.__supports_temperature is None:
        #    self.__supports_temperature = self.__light.supports_temperature()

    async def get_power(self):
        self.connect()

        (future, callback) = self.__use_callback()

        self.__light.get_power(callback)

        await future
        return self.__light.power_level > 0

    def set_power(self, turn_on: bool, duration: int):
        self.connect()
        self.__light.set_power(turn_on, duration)

    def get_colour(self):
        self.connect()
        return LIFXColour(self.__light.get_color())

    def set_colour(self, colour: LIFXColour, duration: int):
        self.connect()
        self.__light.set_color(colour.list, duration)

    @classmethod
    def __find_free_port(cls):
        connection = socket(AF_INET, SOCK_STREAM)
        connection.bind(('', 0))
        _, port = connection.getsockname()
        connection.close()
        return port

    @classmethod
    def __use_callback(cls):
        loop = get_running_loop()

        future = loop.create_future()

        def callback(*args):
            loop.call_soon_threadsafe(future.set_result, args)

        return (future, callback)
