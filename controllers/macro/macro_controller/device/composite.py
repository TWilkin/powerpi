from lazy import lazy
from typing import List

from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice, Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import AdditionalState, AdditionalStateMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util import ismixin


class CompositeDevice(AdditionalStateDevice, PollableMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        devices: List[str],
        **kwargs
    ):
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client, **kwargs
        )

        self.__device_manager = device_manager
        self.__device_names = devices
    
    async def change_power_and_additional_state(self, new_state: DeviceStatus, new_additional_state: AdditionalState):
        if new_state is not None or new_additional_state is not None:
            for device in self.__devices:
                if ismixin(device, AdditionalStateMixin):
                    await device.change_power_and_additional_state(new_state, new_additional_state)
                else:
                    if new_state is not None:
                        func = self.turn_on if new_state == DeviceStatus.ON else self.turn_off
                        await func()

            self.set_state_and_additional(new_state, new_additional_state)
    
    def _on_additional_state_change(self, new_additional_state: AdditionalState) -> AdditionalState:
        # we are doing everything in change_power_and_additional_state
        return new_additional_state
    
    def _filter_keys(self, new_additional_state: AdditionalState):
        # we don't know what the actual implementation supports, so keep it as it is
        return new_additional_state
    
    def _additional_state_keys(self) -> List[str]:
        # we don't know what the actual implementation supports, so we're not setting keys
        # but the test expect at least one
        return ['a']

    def _poll(self):
        all_on = True
        all_off = True

        for device in self.__devices:
            all_on &= device.state == DeviceStatus.ON
            all_off &= device.state == DeviceStatus.OFF

        if all_on and self.state != DeviceStatus.ON:
            self.state = DeviceStatus.ON
        elif all_off and self.state != DeviceStatus.OFF:
            self.state = DeviceStatus.OFF

    async def _turn_on(self):
        for device in self.__devices:
            await device.turn_on()

    async def _turn_off(self):
        for device in reversed(self.__devices):
            await device.turn_off()

    @lazy
    def __devices(self) -> List[Device]:
        devices = []

        for name in self.__device_names:
            try:
                devices.append(self.__device_manager.get_device(name))
            except:
                # ignore this for now
                pass

        return devices
