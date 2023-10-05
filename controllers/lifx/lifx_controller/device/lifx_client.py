from asyncio import get_running_loop
from socket import AF_INET, SOCK_STREAM, socket
from typing import Callable, Tuple

from aiolifx.aiolifx import Light
from aiolifx.msgtypes import LightState, StateVersion
from aiolifx.products import features_map
from powerpi_common.logger import Logger
from powerpi_common.util.data import Range

from lifx_controller.device.lifx_colour import LIFXColour


class LIFXClient:
    # pylint: disable=too-many-instance-attributes

    def __init__(
        self,
        logger: Logger
    ):
        self.__logger = logger

        self.__light = None

        self.__feature_listener: Callable | None = None

        self.__supports_colour: bool | None = None
        self.__supports_temperature: bool | None = None

        self.__kelvin_range: Range | None = None

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

    @property
    def colour_temperature_range(self):
        return self.__kelvin_range

    def add_feature_listener(self, listener: Callable):
        self.__feature_listener = listener

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

        if self.__supports_colour is None or self.__supports_temperature is None:
            await self.__set_features()

    async def get_state(self) -> Tuple[bool | None, LIFXColour | None]:
        await self.connect()

        response: LightState | None = await self.__use_callback(self.__light.get_color)

        if response is not None:
            powered = response.power_level > 0
            colour = LIFXColour(response.color)

            return (powered, colour)

        return (None, None)

    async def get_power(self):
        (powered, _) = await self.get_state()
        return powered

    async def set_power(self, turn_on: bool, duration: int):
        await self.connect()

        await self.__use_callback(self.__light.set_power, value=turn_on, duration=duration)

    async def get_colour(self):
        (_, colour) = await self.get_state()
        return colour

    async def set_colour(self, colour: LIFXColour, duration: int):
        await self.connect()

        # ensure the values are in the allowable range
        if self.supports_temperature and \
                (colour.temperature < self.__kelvin_range.min
                    or colour.temperature > self.__kelvin_range.max):
            original = colour.temperature

            colour.temperature = self.__kelvin_range.restrict(
                colour.temperature
            )

            self.__logger.warning(
                f'Unsupported temperature {original} rounded to {colour.temperature}'
            )

        await self.__use_callback(self.__light.set_color, value=colour.list, duration=duration)

    async def __set_features(self):
        version: StateVersion | None = await self.__use_callback(self.__light.get_version)

        if version is not None:
            features = features_map[version.product]

            self.__supports_colour = features.get('color', False)

            min_kelvin = features.get('min_kelvin', None)
            max_kelvin = features.get('max_kelvin', None)

            self.__kelvin_range = Range(min_kelvin, max_kelvin)
            self.__supports_temperature = min_kelvin is not None \
                and max_kelvin is not None \
                and min_kelvin != max_kelvin

            if self.__feature_listener is not None:
                self.__feature_listener()

    @classmethod
    def __find_free_port(cls):
        with socket(AF_INET, SOCK_STREAM) as connection:
            connection.bind(('', 0))

            _, port = connection.getsockname()

        return port

    @classmethod
    async def __use_callback(cls, method: Callable, **kwargs):
        loop = get_running_loop()

        # create a future we can await to capture the callback results
        future = loop.create_future()

        # a callback that will set the results in the future
        def callback(_: Light, response):
            loop.call_soon_threadsafe(future.set_result, response)

        # call the method using the callback
        method(callb=callback, **kwargs)

        # return the from the awaited future
        return await future
