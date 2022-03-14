from abc import ABC


class BaseDevice(ABC):
    '''
    Abstact base class for both "devices" and "sensors".
    '''

    def __init__(self, name: str, display_name: str = None, **_):
        self._name = name
        self._display_name = display_name if display_name is not None else name

    @property
    def name(self):
        '''
        Returns the unique name identifier for this device/sensor.
        '''
        return self._name

    @property
    def display_name(self):
        '''
        Returns the display name for this device/sensor.
        '''
        return self._display_name

    def __str__(self):
        return f'{type(self).__name__}({self._display_name})'
