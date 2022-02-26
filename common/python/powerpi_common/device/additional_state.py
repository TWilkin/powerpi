from abc import abstractmethod
from typing import Any, Dict

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util import await_or_sync
from .device import Device
from .types import DeviceStatus


AdditionalState = Dict[str, Any]


class AdditionalStateDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__additional_state = None
    
    @property
    def additional_state(self):
        if self.__additional_state:
            return self.__additional_state
        
        return {}
    
    @additional_state.setter
    def additional_state(self, new_state):
        self.__additional_state = new_state

        self._broadcast_state_change()
    
    def update_state_no_broadcast(self, new_power_state: DeviceStatus, new_additional_state: AdditionalState):
        Device.update_state_no_broadcast(self, new_power_state)
        self.__additional_state = new_additional_state
    
    def set_state_and_additional(self, state: DeviceStatus, new_additional_state: AdditionalState):
        if state is not None:
            Device.update_state_no_broadcast(self, state)
        
        if len(new_additional_state) > 0:
            self.__additional_state = new_additional_state

        self._broadcast_state_change()
    
    async def change_power_and_additional_state(self, new_power_state: DeviceStatus, new_additional_state: AdditionalState):
        try:
            if new_power_state is not None:
                self._logger.info(f'Turning {new_power_state} device {self}')

                if new_power_state == 'on':
                    await await_or_sync(self._turn_on)
                else:
                    await await_or_sync(self._turn_off)
            
            if len(new_additional_state) > 0:
                # there is other work to do
                new_additional_state = self._on_additional_state_change(new_additional_state)
            
            self.set_state_and_additional(new_power_state, new_additional_state)
        except Exception as e:
            self._logger.exception(e)
            return
        
    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        await await_or_sync(self._on_additional_state_change, new_additional_state)
    
    @abstractmethod
    def _on_additional_state_change(self, new_additional_state: AdditionalState):
        raise NotImplementedError
    
    def _format_state(self):
        result = Device._format_state(self)

        if self.__additional_state:
            for key in self.__additional_state:
                to_json = getattr(self.__additional_state[key], 'to_json', None)

                if callable(to_json):
                    result[key] = to_json()
                else:
                    result[key] = self.__additional_state[key]
        
        return result
