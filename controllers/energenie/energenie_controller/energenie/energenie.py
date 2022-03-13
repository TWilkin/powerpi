from abc import ABC, abstractmethod
from asyncio import Task, get_event_loop, wait_for, sleep
from asyncio.exceptions import CancelledError, TimeoutError as AsyncTimeoutError
from contextlib import suppress
from threading import Lock
from typing import Union


class EnergenieInterface(ABC):
    __device_lock = Lock()

    def __init__(self):
        self._home_id: Union[int, None] = None
        self._device_id: Union[int, None] = None
        self.__pair_task: Union[Task, None] = None

    def set_ids(self, home_id: int, device_id: int):
        self._home_id = home_id
        self._device_id = device_id

    def turn_on(self):
        with EnergenieInterface.__device_lock:
            self._turn_on()

    def turn_off(self):
        with EnergenieInterface.__device_lock:
            self._turn_off()

    async def start_pair(self, timeout: float):
        with EnergenieInterface.__device_lock:
            with suppress(CancelledError) and suppress(AsyncTimeoutError):
                self.__pair_task = get_event_loop().create_task(self.__pair())
                await wait_for(self.__pair_task, timeout)

            self.__pair_task = None

    def stop_pair(self):
        if self.__pair_task is not None:
            self.__pair_task.cancel()

    @abstractmethod
    def _turn_on(self):
        raise NotImplementedError

    @abstractmethod
    def _turn_off(self):
        raise NotImplementedError

    async def __pair(self):
        # to pair we simply turn the device on/off slowly
        while True:
            await sleep(1)
            self._turn_on()

            await sleep(1)
            self._turn_off()
