from typing import Callable

from powerpi_common.variable import DeviceVariable


class Action:
    '''An Action to perform when an event message is received.'''

    def __init__(self, action_type: str, action: Callable[[DeviceVariable], None]):
        self.__action_type = action_type
        self.__action = action

    @property
    def action_type(self):
        return self.__action_type

    def execute(self, device: DeviceVariable):
        '''Execute this action for the given device.'''
        self.__action(device)

    def __str__(self):
        return f'Action({self.__action_type})'
