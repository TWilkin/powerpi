import re
from asyncio import get_running_loop
from socket import AF_INET, SOCK_STREAM, gethostbyname, socket
from typing import Callable, Union

from aiolifx.aiolifx import Light
from aiolifx.products import features_map
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

    async def connect(self):
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

            await self.__set_features()

    async def get_power(self):
        await self.connect()

        (_, power_level) = await self.__use_callback(self.__light.get_power)

        return power_level.power_level > 0

    def set_power(self, turn_on: bool, duration: int):
        self.connect()
        self.__light.set_power(turn_on, duration)

    def get_colour(self):
        self.connect()
        return LIFXColour(self.__light.get_color())

    def set_colour(self, colour: LIFXColour, duration: int):
        self.connect()
        self.__light.set_color(colour.list, duration)

    async def __set_features(self):
        (_, version) = await self.__use_callback(self.__light.get_version)

        features = features_map[version.product]

        self.__supports_colour = features['color']
        self.__supports_temperature = features['min_kelvin'] != features['max_kelvin']

    @classmethod
    def __find_free_port(cls):
        connection = socket(AF_INET, SOCK_STREAM)
        connection.bind(('', 0))
        _, port = connection.getsockname()
        connection.close()
        return port

    @classmethod
    async def __use_callback(cls, method: Callable, *args):
        loop = get_running_loop()

        # create a future we can await to capture the callback results
        future = loop.create_future()

        # a callback that will set the results in the future
        def callback(*args):
            loop.call_soon_threadsafe(future.set_result, args)

        # call the method passing the args
        method(callback, *args)

        # return the result by awaiting the future
        return await future
