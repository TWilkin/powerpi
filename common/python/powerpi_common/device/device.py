from abc import abstractmethod

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util import await_or_sync
from .base import BaseDevice
from .consumers import DeviceChangeEventConsumer, DeviceStatusEventConsumer


class Device(BaseDevice, DeviceChangeEventConsumer):
    class __StatusEventConsumer(DeviceStatusEventConsumer):
        def __init__(self, device, mqtt_client: MQTTClient):
            DeviceStatusEventConsumer.__init__(
                self, device, device._config, device._logger
            )
            self.__mqtt_client = mqtt_client

            mqtt_client.add_consumer(self)

        def _update_device(self, new_power_state):
            # override default behaviour to prevent events generated for state change
            self._device._update_state_no_broadcast(new_power_state)

            # remove this consumer as it has completed its job
            self.__mqtt_client.remove_consumer(self)

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
        self.__state = 'unknown'

        self._producer = mqtt_client.add_producer()

        mqtt_client.add_consumer(self)

        self.__StatusEventConsumer(self, mqtt_client)

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state):
        self.__state = new_state

        self._broadcast_state_change()

    async def turn_on(self):
        self._logger.info(f'Turning on device {self}')
        await await_or_sync(self._turn_on)
        self.state = 'on'

    async def turn_off(self):
        self._logger.info(f'Turning off device {self}')
        await await_or_sync(self._turn_off)
        self.state = 'off'
    
    async def change_power(self, new_power_state: str):
        try:
            if new_power_state is not None:
                if new_power_state == 'on':
                    await self.turn_on()
                else:
                    await self.turn_off()
        except Exception as e:
            self._logger.exception(e)
            return

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError

    def _update_state_no_broadcast(self, new_power_state: str):
        self.__state = new_power_state

    def _broadcast_state_change(self):
        message = self._format_state()

        self._logger.info(f'Device "{self._name}" now has state {message}')

        topic = f'device/{self._name}/status'
        self._producer(topic, message)

    def _format_state(self):
        return {'state': self.state}

    def __str__(self):
        return f'{type(self).__name__}({self._display_name}, {self._format_state()})'
