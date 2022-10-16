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
