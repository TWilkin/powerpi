from abc import ABC, abstractmethod
from typing import Union


class PiJuiceInterface(ABC):
    @property
    @abstractmethod
    def battery_level(self) -> Union[int, None]:
        '''
        Return the current battery level of the PiJuice.
        '''
        raise NotImplementedError

    @property
    @abstractmethod
    def battery_charging(self) -> bool:
        '''
        Return the current charging status of the PiJuice.
        '''
        raise NotImplementedError

    @property
    @abstractmethod
    def battery_temperature(self) -> Union[int, None]:
        '''
        Return the current battery temperature of the PiJuice.
        '''
        raise NotImplementedError

    @property
    @abstractmethod
    def wake_up_on_charge(self) -> int:
        '''
        Get the battery charge percentage at which to turn the Pi back on.
        '''
        raise NotImplementedError

    @wake_up_on_charge.setter
    @abstractmethod
    def wake_up_on_charge(self, new_value: int):
        '''
        Set the battery charge percentage at which to turn the Pi back on.
        '''
        raise NotImplementedError

    @property
    @abstractmethod
    def charge_battery(self) -> bool:
        '''
        Get whether the battery will charge or not.
        '''
        raise NotImplementedError

    @charge_battery.setter
    @abstractmethod
    def charge_battery(self, new_value: bool):
        '''
        Set whether the battery will charge or not.
        '''
        raise NotImplementedError

    @abstractmethod
    def shutdown(self, delay: int):
        '''
        Tell the PiJuice to cut the power in delay seconds.
        '''
        raise NotImplementedError
