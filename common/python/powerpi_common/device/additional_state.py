from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from .device import Device
from .mixin import AdditionalState, AdditionalStateMixin
from .types import DeviceStatus


class AdditionalStateDevice(Device, AdditionalStateMixin):
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
    def additional_state(self, new_additional_state: AdditionalState):
        new_additional_state = self._filter_keys(new_additional_state)

        if len(new_additional_state) > 0:
            self.__additional_state = new_additional_state

            self._broadcast_state_change()
    
    def update_state_no_broadcast(self, new_state: DeviceStatus, new_additional_state: AdditionalState):
        Device.update_state_no_broadcast(self, new_state)
        self.__additional_state = self._filter_keys(new_additional_state)
    
    def set_state_and_additional(self, state: DeviceStatus, new_additional_state: AdditionalState):
        if state is not None:
            Device.update_state_no_broadcast(self, state)
        
        new_additional_state = self._filter_keys(new_additional_state)

        if len(new_additional_state) > 0:
            self.__additional_state = new_additional_state

        self._broadcast_state_change()
    
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
