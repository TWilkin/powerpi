from abc import ABC, abstractmethod
from asyncio import wait_for
from contextlib import suppress
from threading import Lock


class EnergenieInterface(ABC):
    __device_lock = Lock()

    def set_ids(self, home_id: int, device_id: int):
        self._home_id = home_id
        self._device_id = device_id
    
    def turn_on(self):
        with EnergenieInterface.__device_lock:
            self._turn_on()

    def turn_off(self):
        with EnergenieInterface.__device_lock:
            self._turn_off()
    
    async def pair(self, timeout: int):
        with EnergenieInterface.__device_lock:
            with suppress(TimeoutError):
                await wait_for(self._pair(), timeout)

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError
    
    @abstractmethod
    async def _pair(self):
        raise NotImplementedError
