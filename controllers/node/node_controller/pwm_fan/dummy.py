from .interface import PWMFanCurve, PWMFanInterface


class DummyPWMFanInterface(PWMFanInterface):
    @property
    def curve(self):
        return {}

    @curve.setter
    def curve(self, new_value: PWMFanCurve):
        pass

    @property
    def cpu_temps(self):
        return []

    @property
    def battery_temps(self):
        return []

    @property
    def fan_speeds(self):
        return []

    async def initialise(self):
        pass

    def clear(self):
        pass
