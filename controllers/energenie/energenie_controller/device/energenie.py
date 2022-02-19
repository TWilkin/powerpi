from abc import ABC, abstractmethod
from threading import Lock


class EnergenieInterface(ABC):
    def __init__(self):
        self.__device_lock = Lock()
    
    def set_ids(self, home_id: int, device_id: int):
        self._home_id = home_id
        self._device_id = device_id
    
    def turn_on(self):
        with self.__device_lock:
            self._turn_on()

    def turn_off(self):
        with self.__device_lock:
            self._turn_off()

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError
