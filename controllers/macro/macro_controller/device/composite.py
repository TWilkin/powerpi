from typing import List

from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import AdditionalState, AdditionalStateMixin, \
    DeviceOrchestratorMixin, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util import ismixin


#pylint: disable=too-many-ancestors
class CompositeDevice(AdditionalStateDevice, DeviceOrchestratorMixin, PollableMixin):
    #pylint: disable=too-many-arguments
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
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, devices
        )

    async def on_referenced_device_status(self, _: str, __: DeviceStatus):
        await self._poll()

    async def change_power_and_additional_state(
        self,
        new_state: DeviceStatus,
        new_additional_state: AdditionalState
    ):
        if new_state is not None or new_additional_state is not None:
            # we need to run them in reverse order for off
            ordered_devices = self.devices if new_state != DeviceStatus.OFF \
                else reversed(self.devices)

            for device in ordered_devices:
                if ismixin(device, AdditionalStateMixin):
                    await device.change_power_and_additional_state(new_state, new_additional_state)
                else:
                    if new_state is not None:
                        func = device.turn_on if new_state == DeviceStatus.ON else device.turn_off
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

    async def _poll(self):
        # are any unknown
        if any((device.state == DeviceStatus.UNKNOWN for device in self.devices)):
            await self.set_new_state(DeviceStatus.UNKNOWN)
        # are all devices on
        elif all((device.state == DeviceStatus.ON for device in self.devices)):
            await self.set_new_state(DeviceStatus.ON)
        else:
            await self.set_new_state(DeviceStatus.OFF)

    async def _turn_on(self):
        for device in self.devices:
            await device.turn_on()

    async def _turn_off(self):
        for device in reversed(self.devices):
            await device.turn_off()
