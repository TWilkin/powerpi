from typing import Awaitable, Callable, Dict

from powerpi_common.device import Device


class EventHandler:
    def __init__(
        self,
        device: Device,
        condition: Dict[str, any],
        action: Callable[[Device], Awaitable[None]]
    ):
        self.__device = device
        self.__condition = condition
        self.__action = action

    async def execute(self, message: dict):
        # execute the action if the condition is met
        if self.check_condition(message):
            await self.__action(self.__device)
            return True

        return False

    def check_condition(self, message: dict):
        if 'message' in self.__condition:
            compare = message.copy()

            if 'timestamp' in message:
                # remove the timestamp before comparison
                del compare['timestamp']

            if compare != self.__condition['message']:
                return False
 
        if 'state' in self.__condition and self.__device.state != self.__condition['state']:
            return False

        return True

    def __str__(self):
        return f'{self.__device}:{self.__action}'
