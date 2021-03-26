from energenie import switch_on, switch_off

from .energenie import EnergenieInterface


class EnergenieInterfaceImpl(EnergenieInterface):
    def turn_on(self):
        switch_on(self._device_id)

    def turn_off(self):
        switch_off(self._device_id)
