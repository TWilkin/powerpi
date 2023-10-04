from enum import StrEnum
from typing import Callable, Dict, Tuple


class Range:
    def __init__(self, min_value: float, max_value: float):
        self.__min = min_value
        self.__max = max_value

    @property
    def min(self):
        return self.__min

    @property
    def max(self):
        return self.__max

    def restrict(self, value: float):
        return max(self.__min, min(self.__max, value))


class Ranges:
    UINT8 = Range(0, 2 ** 8 - 1)
    UINT16 = Range(0, 2 ** 16 - 1)


class DataType(StrEnum):
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
            lambda milliseconds: milliseconds / 1000, # to local
            lambda seconds: seconds * 1000,           # from local
            Range(0, 10) # optional                   # range restriction
        )
    }
    In this example the local value is seconds and the standard value is milliseconds
    restricted by the range between 0 and 10s.
    '''

    __Converter = Callable[[float], float]

    def __init__(
            self,
            converters: Dict[
                DataType,
                Tuple[__Converter, __Converter, Range]
            ]):
        self.__converters = converters

    def from_standard_unit(self, data_type: DataType, value: float):
        '''
        Convert the value from the standard value to the internal value for the device.
        '''

        if data_type in self.__converters:
            converted = self.__converters[data_type][0](value)

            if len(self.__converters[data_type]) == 3:
                # has a range restriction
                return self.__converters[data_type][2].restrict(converted)

            return converted

        return value

    def to_standard_unit(self, data_type: DataType, value: float):
        '''
        Convert the value from the internal value to the standard value for the device.
        '''

        if data_type in self.__converters:
            return self.__converters[data_type][1](value)

        return value
