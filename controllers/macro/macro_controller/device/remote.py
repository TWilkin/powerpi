import contextlib

from asyncio import Event, wait_for
from asyncio.exceptions import TimeoutError

from powerpi_common.config import Config
from powerpi_common.device import DeviceStatus
from powerpi_common.device.consumers import DeviceStatusEventConsumer
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class RemoteDevice(DeviceStatusEventConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        timeout: float = 12.5,
        **_
    ):
        self.__logger = logger
        self.__name = name
        self.__timeout = timeout

        DeviceStatusEventConsumer.__init__(self, self, config, logger)

        self.__state = DeviceStatus.UNKNOWN
        self.__producer = mqtt_client.add_producer()
        self.__waiting = Event()

        mqtt_client.add_consumer(self)

    @property
    def name(self):
        return self.__name

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: str):
        self.__state = new_state
        self.__waiting.set()

    def set_state_and_additional(self, state: str, _: dict):
        self.state = state

    async def turn_on(self):
        await self.__send_message(DeviceStatus.ON)

    async def turn_off(self):
        await self.__send_message(DeviceStatus.OFF)

    async def __send_message(self, state: DeviceStatus):
        topic = f'device/{self.__name}/change'

        self.__producer(topic, {'state': state})

        self.__logger.info(
            f'Waiting for state update for device "{self.__name}"'
        )

        self.__waiting.clear()
        await self.__wait(self.__timeout)

        self.__logger.info(
            f'Continuing after device "{self.__name}"'
        )
    
    async def __wait(self, timeout: float):
        with contextlib.suppress(TimeoutError):
            await wait_for(self.__waiting.wait(), timeout)

    def __str__(self):
        return f'{type(self).__name__}({self.__name}, {self.__state})'
