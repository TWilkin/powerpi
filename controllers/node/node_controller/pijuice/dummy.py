from .interface import PiJuiceInterface


class DummyPiJuiceInterface(PiJuiceInterface):
    @property
    def battery_level(self):
        return None

    @property
    def battery_charging(self):
        return False
