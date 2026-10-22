from powerpi_common.device import AdditionalStateDevice
from powerpi_common.device.mixin import NewPollableMixin
from powerpi_common.util.data import DataType

from .hive_device import HiveDeviceMixin


class HiveThermostatDevice(AdditionalStateDevice, NewPollableMixin, HiveDeviceMixin):
    def __init__(
        self,
        **kwargs
    ):
        AdditionalStateDevice.__init__(self, **kwargs)
        NewPollableMixin.__init__(self, **kwargs)
        HiveDeviceMixin.__init__(self, **kwargs)

    def _additional_state_keys(self):
        return [DataType.TEMPERATURE]

    async def _turn_on(self):
        # intentionally does nothing
        return False

    async def _turn_off(self):
        # intentionally does nothing
        return False

    async def _poll(self):
        updated_additional_state = {}

        # read the heating state
        device = await self.heating_device()
        if device.status is not None:
            updated_additional_state[DataType.TEMPERATURE] = device.status.target_temperature

        # identify if we should broadcast
        changed = updated_additional_state != self.additional_state
        if changed:
            new_additional_state = {
                **self.additional_state,
                **updated_additional_state
            }

            self.set_state_and_additional(
                self.state,
                new_additional_state
            )
