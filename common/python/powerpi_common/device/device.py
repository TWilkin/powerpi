from abc import abstractmethod
from asyncio import Lock
from typing import Awaitable, Callable, Union

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util import await_or_sync
from .base import BaseDevice
from .consumers import DeviceChangeEventConsumer, DeviceInitialStatusEventConsumer
from .types import DeviceStatus


class Device(BaseDevice, DeviceChangeEventConsumer):
    '''
    Abstract base class for a "device", which supports being turned on/off via
    change messages from the message queue. Will broadcast status change 
    messages once it has moved between the on/off states.
    '''

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

        self.__lock = Lock()

        mqtt_client.add_consumer(self)

        # add listener to get the initial state from the queue, if there is one
        DeviceInitialStatusEventConsumer(self, config, logger, mqtt_client)

    @property
    def state(self):
        '''
        Returns the current state (on/off/unknown) of this device.
        '''
        return self.__state

    @state.setter
    def state(self, new_state: DeviceStatus):
        '''
        Update the state of this device to new_state, and broadcast the change
        to the message queue.
        '''
        self.__state = new_state

        self._broadcast_state_change()

    def update_state_no_broadcast(self, new_state: DeviceStatus):
        '''
        Update this devices' state but do not broadcast to the message queue.
        '''
        self.__state = new_state

    async def set_new_state(self, new_state: DeviceStatus):
        '''
        Update this devices' state and broadcast to the message queue 
        if the new_state is different from the current state.
        '''
        async with self.__lock:
            if self.state != new_state:
                self.state = new_state

    async def turn_on(self):
        '''
        Turn this device on, and broadcast the state change to the message queue.
        '''
        await self.__change_power_handler(self._turn_on, DeviceStatus.ON)

    async def turn_off(self):
        '''
        Turn this device off, and broadcast the state change to the message queue.
        '''
        await self.__change_power_handler(self._turn_off, DeviceStatus.OFF)

    async def change_power(self, new_state: DeviceStatus):
        '''
        Turn this device on or off, depending on the value of new_state.
        If new_state is none, do nothing.
        '''
        if new_state is not None:
            if new_state == DeviceStatus.ON:
                await self.turn_on()
            else:
                await self.turn_off()

    @abstractmethod
    def _turn_on(self):
        '''
        Implement this method to turn the concrete device implementation on.
        Supports both sync and async implementations.
        '''
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        '''
        Implement this method to turn the concrete device implementation off.
        Supports both sync and async implementations.
        '''
        raise NotImplementedError

    def _broadcast_state_change(self):
        message = self._format_state()

        self._logger.info(f'Device "{self._name}" now has state {message}')

        topic = f'device/{self._name}/status'
        self._producer(topic, message)

    def _format_state(self):
        return {'state': self.state}

    async def __change_power_handler(
        self,
        func: Union[Awaitable[None], Callable[[], None]],
        new_status: DeviceStatus
    ):
        # pylint: disable=broad-except
        try:
            async with self.__lock:
                self._logger.info(f'Turning {new_status} device {self}')
                await await_or_sync(func)
                self.state = new_status
        except Exception as ex:
            self._logger.exception(ex)
            self.state = DeviceStatus.UNKNOWN

    def __str__(self):
        return f'{type(self).__name__}({self._display_name}, {self._format_state()})'
