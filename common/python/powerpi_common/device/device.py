from abc import abstractmethod

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, StatusEventConsumer, PowerEventConsumer
from powerpi_common.util import await_or_sync
from .base import BaseDevice


class Device(BaseDevice, PowerEventConsumer):
    class __StatusEventConsumer(StatusEventConsumer):
        def __init__(self, device, mqtt_client: MQTTClient):
            StatusEventConsumer.__init__(
                self, device, device._config, device._logger
            )
            self.__mqtt_client = mqtt_client

            mqtt_client.add_consumer(self)

        def _update_device(self, new_power_state, new_additional_state):
            # override default behaviour to prevent events generated for state change
            self._device._update_state_no_broadcast(new_power_state, new_additional_state)

            # remove this consumer as it has completed its job
            self.__mqtt_client.remove_consumer(self)

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str,
        display_name: str = None,
        visible: bool = False
    ):
        BaseDevice.__init__(self, name, display_name, visible)
        PowerEventConsumer.__init__(self, self, config, logger)

        self._logger = logger
        self.__state = 'unknown'
        self.__additional_state = None

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
    
    @property
    def additional_state(self):
        if self.__additional_state:
            return self.__additional_state
        
        return {}
    
    @additional_state.setter
    def additional_state(self, new_state):
        self.__additional_state = new_state

        self._broadcast_state_change()
    
    def set_state_and_additional(self, state: str, additional_state: dict):
        if state is not None:
            self.__state = state
        
        if len(additional_state) > 0:
            self.__additional_state = additional_state

        self._broadcast_state_change()
    
    async def poll(self):
        await await_or_sync(self._poll)

    async def turn_on(self):
        self._logger.info(f'Turning on device {self}')
        await await_or_sync(self._turn_on)
        self.state = 'on'

    async def turn_off(self):
        self._logger.info(f'Turning off device {self}')
        await await_or_sync(self._turn_off)
        self.state = 'off'
    
    async def change_power_and_additional_state(self, new_power_state: str, new_additional_state: dict):
        try:
            if new_power_state is not None:
                self._logger.info(f'Turning {new_power_state} device {self}')

                if new_power_state == 'on':
                    await await_or_sync(self._turn_on)
                else:
                    await await_or_sync(self._turn_off)
            
            if len(new_additional_state) > 0:
                # there is other work to do
                new_additional_state = self._change_additional_state(new_additional_state)
            
            self.set_state_and_additional(new_power_state, new_additional_state)
        except Exception as e:
            self._logger.exception(e)
            return

    @abstractmethod
    def _poll(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError
    
    def _change_additional_state(self, new_additional_state: dict):
        return new_additional_state

    def _update_state_no_broadcast(self, new_power_state: str, new_additional_state: dict):
        self.__state = new_power_state
        self.__additional_state = new_additional_state
    
    def _broadcast_state_change(self):
        message = self._format_state()

        self._logger.info(f'Device "{self._name}" now has state {message}')

        topic = f'device/{self._name}/status'
        self._producer(topic, message)

    def _format_state(self):
        result = {'state': self.state}

        if self.__additional_state:
            for key in self.__additional_state:
                to_json = getattr(self.__additional_state[key], 'to_json', None)

                if callable(to_json):
                    result[key] = to_json()
                else:
                    result[key] = self.__additional_state[key]
        
        return result

    def __str__(self):
        return f'{type(self).__name__}({self._display_name}, {self._format_state()})'
