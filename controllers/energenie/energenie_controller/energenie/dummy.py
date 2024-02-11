from .energenie import EnergenieInterface


class DummyEnergenieInterface(EnergenieInterface):
    def _turn_on(self):
        """The DummyEnergenieInterface does not support turning on."""

    def _turn_off(self):
        """The DummyEnergenieInterface does not support turning off."""
