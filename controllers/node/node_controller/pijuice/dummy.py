from .interface import PiJuiceInterface


class DummyPiJuiceInterface(PiJuiceInterface):
    @property
    def battery_level(self):
        return 21

    @property
    def battery_charging(self):
        return False
