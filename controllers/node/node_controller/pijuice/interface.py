from abc import ABC, abstractmethod
from typing import Union


class PiJuiceInterface(ABC):
    @property
    @abstractmethod
    def battery_level(self) -> Union[int, None]:
        raise NotImplementedError

    @property
    @abstractmethod
    def battery_charging(self) -> bool:
        raise NotImplementedError

    @property
    @abstractmethod
    def wake_up_on_charge(self) -> int:
        raise NotImplementedError

    @wake_up_on_charge.setter
    @abstractmethod
    def wake_up_on_charge(self, new_value: int):
        raise NotImplementedError

    @property
    @abstractmethod
    def charge_battery(self) -> bool:
        raise NotImplementedError

    @charge_battery.setter
    @abstractmethod
    def charge_battery(self, new_value: bool):
        raise NotImplementedError
