import contextlib

from asyncio import Event, wait_for
from asyncio.exceptions import TimeoutError as AsyncTimeoutError
from typing import List, Union

from powerpi_common.config import Config
from powerpi_common.device import DeviceStatus
from powerpi_common.device.consumers import DeviceStatusEventConsumer
from powerpi_common.device.mixin import AdditionalState, AdditionalStateMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class RemoteDevice(DeviceStatusEventConsumer, AdditionalStateMixin):
    #pylint: disable=too-many-arguments
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
        self.__additional_state = {}

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

    @property
    def additional_state(self):
        return self.__additional_state

    @additional_state.setter
    def additional_state(self, new_additional_state: AdditionalState):
        self.__additional_state = new_additional_state
        self.__waiting.set()

    async def change_power_and_additional_state(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        await self.__send_message(new_state, new_additional_state)

    def set_state_and_additional(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        self.__state = new_state
        self.__additional_state = new_additional_state
        self.__waiting.set()

    async def on_additional_state_change(self, new_additional_state: AdditionalState) -> AdditionalState:
        # we are doing everything in change_power_and_additional_state
        return new_additional_state

    def _filter_keys(self, new_additional_state: AdditionalState):
        # we don't know what the actual implementation supports, so keep it as it is
        return new_additional_state

    def _additional_state_keys(self) -> List[str]:
        # we don't know what the actual implementation supports, so we're not setting keys
        return []

    async def turn_on(self):
        await self.__send_message(DeviceStatus.ON)

    async def turn_off(self):
        await self.__send_message(DeviceStatus.OFF)

    async def __send_message(
        self,
        state: Union[DeviceStatus, None],
        additional_state: Union[AdditionalState, None] = None
    ):
        topic = f'device/{self.__name}/change'
        message = {}

        if additional_state is not None:
            message = {**additional_state}

        if state is not None:
            message['state'] = state

        self.__waiting.clear()

        self.__producer(topic, message)

        self.__logger.info(
            f'Waiting for state update for device "{self.__name}"'
        )

        await self.__wait(self.__timeout)

        self.__logger.info(
            f'Continuing after device "{self.__name}"'
        )

    async def __wait(self, timeout: float):
        with contextlib.suppress(AsyncTimeoutError):
            await wait_for(self.__waiting.wait(), timeout)

    def __str__(self):
        return f'{type(self).__name__}({self.__name}, {self.__state})'
