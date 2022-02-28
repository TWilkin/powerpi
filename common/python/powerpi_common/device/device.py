from abc import abstractmethod
from typing import Awaitable, Callable, Union

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util import await_or_sync
from .base import BaseDevice
from .consumers import DeviceChangeEventConsumer, DeviceInitialStatusEventConsumer
from .types import DeviceStatus


class Device(BaseDevice, DeviceChangeEventConsumer):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        BaseDevice.__init__(self, **kwargs)
        DeviceChangeEventConsumer.__init__(self, self, config, logger)

        self._logger = logger
        self.__state = DeviceStatus.UNKNOWN

        self._producer = mqtt_client.add_producer()

        mqtt_client.add_consumer(self)

        # add listener to get the initial state from the queue, if there is one
        DeviceInitialStatusEventConsumer(self, config, logger, mqtt_client)

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state):
        self.__state = new_state

        self._broadcast_state_change()
    
    def update_state_no_broadcast(self, new_power_state: DeviceStatus):
        self.__state = new_power_state

    async def turn_on(self):
        self._logger.info(f'Turning on device {self}')
        await self.__change_power_handler(self._turn_on, DeviceStatus.ON)

    async def turn_off(self):
        self._logger.info(f'Turning off device {self}')
        await self.__change_power_handler(self._turn_off, DeviceStatus.OFF)
    
    async def change_power(self, new_power_state: DeviceStatus):
        if new_power_state is not None:
            if new_power_state == DeviceStatus.ON:
                await self.turn_on()
            else:
                await self.turn_off()

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError

    def _broadcast_state_change(self):
        message = self._format_state()

        self._logger.info(f'Device "{self._name}" now has state {message}')

        topic = f'device/{self._name}/status'
        self._producer(topic, message)

    def _format_state(self):
        return {'state': self.state}
    
    async def __change_power_handler(self, func: Union[Awaitable[None], Callable[[], None]], new_status: DeviceStatus):
        try:
            await await_or_sync(func)
            self.state = new_status
        except Exception as e:
            self._logger.exception(e)
            self.state = DeviceStatus.UNKNOWN

    def __str__(self):
        return f'{type(self).__name__}({self._display_name}, {self._format_state()})'
