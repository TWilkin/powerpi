from lazy import lazy
from typing import List

from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class MutexDevice(Device, DeviceOrchestratorMixin, PollableMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        on_devices: List[str],
        off_devices: List[str],
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, on_devices + off_devices
        )

        self.__device_manager = device_manager
        self.__on_device_names = on_devices
        self.__off_device_names = off_devices
    
    def on_referenced_device_status(self, _: str, __: DeviceStatus):
        self._poll()

    def _poll(self):
        # are any unknown
        if any([device.state == DeviceStatus.UNKNOWN for device in self.devices]):
            self.set_new_state(DeviceStatus.UNKNOWN)
        # are all on devices on and off devices off
        elif all([device.state == DeviceStatus.ON for device in self.__on_devices]) \
                and all([device.state == DeviceStatus.OFF for device in self.__off_devices]):
            self.set_new_state(DeviceStatus.ON)
        else:
            self.set_new_state(DeviceStatus.OFF)

    async def _turn_on(self):
        for device in self.__off_devices:
            await device.turn_off()

        for device in self.__on_devices:
            await device.turn_on()

    async def _turn_off(self):
        for device in self.devices:
            await device.turn_off()

    @lazy
    def __on_devices(self) -> List[Device]:
        return [self.__device_manager.get_device(device_name) for device_name in self.__on_device_names]

    @lazy
    def __off_devices(self) -> List[Device]:
        return [self.__device_manager.get_device(device_name) for device_name in self.__off_device_names]
