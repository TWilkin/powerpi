from enum import Enum
from typing import Callable, Dict, Tuple


class Ranges(Tuple[int, int], Enum):
    UINT8 = (0, 2 ** 8)
    UINT16 = (0, 2 ** 16)


def restrict(value: int, value_range: Tuple[int, int]):
    min_value, max_value = value_range

    return max(min_value, min(max_value, value))


class DataType(str, Enum):
    BRIGHTNESS = 'brightness'
    DURATION = 'duration'
    HUE = 'hue'
    SATURATION = 'saturation'
    TEMPERATURE = 'temperature'


class Standardiser:
    '''
    Standardiser provides a simple interface to convert from a local value to a standardised value
    and vice versa.

    The dictionary of converters should be formatted as follows:
    {
        DURATION: (
            lambda value: value / 1000,
            lambda value: value * 1000
        )
    }
    In this example the local value is seconds and the standard value is milliseconds.
    '''

    def __init__(
            self,
            converters: Dict[
                DataType,
                Tuple[Callable[[int], int], Callable[[int], int]]
            ]):
        self.__converters = converters

    def convert(self, data_type: DataType, value: int):
        '''
        Convert the value from the standard value to the internal value for the device.
        '''

        if data_type in self.__converters:
            return self.__converters[data_type][0](value)

        return value

    def revert(self, data_type: DataType, value: int):
        '''
        Convert the value from the internal value to the standard value for the device.
        '''

        if data_type in self.__converters:
            return self.__converters[data_type][1](value)

        return value
