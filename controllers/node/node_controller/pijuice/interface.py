from abc import ABC, abstractmethod


class PiJuiceInterface(ABC):
    @property
    @abstractmethod
    def battery_level(self) -> int:
        raise NotImplementedError
