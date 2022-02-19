from energenie import switch_on, switch_off

from .energenie import EnergenieInterface


class EnergenieInterfaceImpl(EnergenieInterface):
    def __init__(self):
        EnergenieInterface.__init__(self)
        
    def _turn_on(self):
        switch_on(self._device_id)

    def _turn_off(self):
        switch_off(self._device_id)
    
    async def _pair(self):
        pass
