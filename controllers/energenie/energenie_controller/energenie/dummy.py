from .energenie import EnergenieInterface


class DummyEnergenieInterface(EnergenieInterface):
    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass
