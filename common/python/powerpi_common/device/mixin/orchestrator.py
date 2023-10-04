import sys
from abc import abstractmethod
from typing import Dict, List, Optional

from powerpi_common.config import Config
from powerpi_common.device.consumers.capability_event_consumer import \
    CapabilityEventConsumer
from powerpi_common.device.consumers.status_event_consumer import \
    DeviceStatusEventConsumer
from powerpi_common.device.types import DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient, MQTTMessage
from powerpi_common.typing import DeviceManagerType, DeviceType
from powerpi_common.util.data import DataType, Range

from .capability import Capability, CapabilityMixin
from .initialisable import InitialisableMixin


class DeviceOrchestratorMixin(InitialisableMixin, CapabilityMixin):
    '''
    Mixin to add device orchestrator functionality (for devices that
    control other devices.)
    '''

    class ReferencedDeviceStateEventListener(DeviceStatusEventConsumer):
        def __init__(
            self,
            main_device: 'DeviceOrchestratorMixin',
            device: DeviceType,
            config: Config,
            logger: Logger
        ):
            DeviceStatusEventConsumer.__init__(self, device, config, logger)

            self.__main_device = main_device

        async def on_message(self, message: MQTTMessage, entity: str, _: str):
            if self._is_message_valid(entity, None):
                new_power_state = message.get('state', DeviceStatus.UNKNOWN)

                await self.__main_device.on_referenced_device_status(
                    self._device.name,
                    new_power_state
                )

    class ReferencedCapabilityEventListener(CapabilityEventConsumer):
        def __init__(
            self,
            main_device: 'DeviceOrchestratorMixin | CapabilityMixin',
            device: DeviceType,
            config: Config,
            logger: Logger
        ):
            CapabilityEventConsumer.__init__(self, device, config, logger)

            self.__main_device = main_device

        async def on_message(self, message: MQTTMessage, entity: str, _: str):
            capability = {**message}
            capability.pop('timestamp', None)

            self.__main_device.on_referenced_device_capability(
                entity,
                capability
            )

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManagerType,
        devices: List[str],
        capability: Optional[bool] = True,
        ** _
    ):
        # pylint: disable=too-many-arguments
        self.__config = config
        self.__logger = logger
        self.__mqtt_client = mqtt_client
        self.__device_manager = device_manager
        self.__devices = devices
        self.__capabilities: Dict[str, Capability] = {}
        self.__capability_enabled = capability

    @property
    def devices(self) -> List[DeviceType]:
        '''
        Return the list of devices this device controls.
        '''
        return [self.__device_manager.get_device(device_name) for device_name in self.__devices]

    @CapabilityMixin.supports_brightness.getter
    def supports_brightness(self):
        # pylint: disable=invalid-overridden-method
        return any(
            device[DataType.BRIGHTNESS] if DataType.BRIGHTNESS in device else False
            for device in self.__capabilities.values()
        )

    @CapabilityMixin.supports_colour_hue_and_saturation.getter
    def supports_colour_hue_and_saturation(self):
        # pylint: disable=invalid-overridden-method
        return any(
            device['colour'][DataType.HUE]
            if 'colour' in device and DataType.HUE in device['colour']
            else False
            and device['colour'][DataType.SATURATION]
            if 'colour' in device and DataType.SATURATION in device['colour']
            else False
            for device in self.__capabilities.values()
        )

    @CapabilityMixin.supports_colour_temperature.getter
    def supports_colour_temperature(self):
        # pylint: disable=invalid-overridden-method

        min_temp = sys.maxsize
        max_temp = -sys.maxsize
        supports_temp = False

        for device in self.__capabilities.values():
            if 'colour' in device and DataType.TEMPERATURE in device['colour']:
                temp = device['colour'][DataType.TEMPERATURE]

                if temp is not False and 'min' in temp and 'max' in temp:
                    min_temp = min(min_temp, temp['min'])
                    max_temp = max(max_temp, temp['max'])
                    supports_temp = True

        if supports_temp:
            return Range(min_temp, max_temp)
        return False

    @abstractmethod
    async def on_referenced_device_status(self, device_name: str, state: DeviceStatus):
        '''
        Method to refresh the orchestrator devices' state based on the changed
        state from the referenced device.
        Must be async.
        '''
        raise NotImplementedError

    def on_referenced_device_capability(self, device_name: str, capability: Capability):
        '''
        Method to refresh the orchestrator devices' capabilities based on the changed
        capability from the referenced device.
        '''
        current = None
        if device_name in self.__capabilities:
            current = self.__capabilities[device_name]

        if current != capability:
            # the capabilities for this referenced device have been updated
            self.__capabilities[device_name] = capability

            if len(self.__capabilities.keys()) == len(self.devices):
                # broadcast when we have the capabilities for all the referenced devices
                self.on_capability_change()

    async def initialise(self):
        for device in self.devices:
            state_listener = self.ReferencedDeviceStateEventListener(
                self, device, self.__config, self.__logger
            )

            self.__mqtt_client.add_consumer(state_listener)

            if self.__capability_enabled:
                capability_listener = self.ReferencedCapabilityEventListener(
                    self, device, self.__config, self.__logger
                )

                self.__mqtt_client.add_consumer(capability_listener)
