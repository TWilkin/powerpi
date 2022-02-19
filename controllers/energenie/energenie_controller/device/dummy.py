from .energenie import EnergenieInterface


class DummyEnergenieInterface(EnergenieInterface):
    def _turn_on(self):
        pass

    def _turn_off(self):
        pass
