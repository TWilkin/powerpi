from .interface import PiJuiceInterface


class DummyPiJuiceInterface(PiJuiceInterface):
    def __init__(self):
        self.__wake_up_on_charge = 0
        self.__charge_battery = False

    @property
    def battery_level(self):
        return None

    @property
    def battery_charging(self):
        return False

    @property
    def battery_temperature(self):
        return None

    @property
    def wake_up_on_charge(self) -> int:
        return self.__wake_up_on_charge

    @wake_up_on_charge.setter
    def wake_up_on_charge(self, new_value: int):
        self.__wake_up_on_charge = new_value

    @property
    def charge_battery(self) -> int:
        return self.__charge_battery

    @charge_battery.setter
    def charge_battery(self, new_value: bool):
        self.__charge_battery = new_value

    def shutdown(self, _: int):
        pass

    def __str__(self):
        return f'''
            charge_battery: {self.__charge_battery}
            wake_up_on_charge: {self.__wake_up_on_charge}
        '''
