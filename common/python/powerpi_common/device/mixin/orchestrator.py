from abc import abstractmethod
from typing import List

from powerpi_common.config import Config
from powerpi_common.device.base import BaseDevice
from powerpi_common.device.consumers.status_event_consumer import DeviceStatusEventConsumer
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from powerpi_common.util import await_or_sync
from .initialisable import InitialisableMixin


class DeviceOrchestratorMixin(InitialisableMixin):
    '''
    Mixin to add device orchestrator functionality (for devices that
    control other devices.)
    '''
    class __ReferencedDeviceStateEventListener(DeviceStatusEventConsumer):
        def __init__(
            self, 
            main_device: 'DeviceOrchestratorMixin', 
            device: BaseDevice, 
            config: Config, 
            logger: Logger
        ):
            DeviceStatusEventConsumer.__init__(self, device, config, logger)

            self.__main_device = main_device
        
        async def on_message(self, message: MQTTMessage, entity: str, _: str):
            if self._is_message_valid(entity, None):
                new_power_state = message.get('state', DeviceStatus.UNKNOWN)

                await await_or_sync(self.__main_device.on_referenced_device_status, self._device.name, new_power_state)
                

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager,
        devices: List[str], 
        **_
    ):
        self.__config = config
        self.__logger = logger
        self.__mqtt_client = mqtt_client
        self.__device_manager = device_manager
        self.__devices = devices
    
    def initialise(self):
        for device in self.devices:
            consumer = self.__ReferencedDeviceStateEventListener(self, device, self.__config, self.__logger)
            self.__mqtt_client.add_consumer(consumer)
    
    @property
    def devices(self) -> List[BaseDevice]:
        '''
        Return the list of devices this device controls.
        '''
        return [self.__device_manager.get_device(device_name) for device_name in self.__devices]

    @abstractmethod
    def on_referenced_device_status(self, device_name: str, state: DeviceStatus):
        '''
        Method to refresh the orchestrator devices' state based on the changed
        state from the referenced device.
        Supports both sync and async implementations.
        '''
        raise NotImplementedError
