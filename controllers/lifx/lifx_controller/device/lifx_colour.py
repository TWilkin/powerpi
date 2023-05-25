import math
from typing import Dict, Tuple

from powerpi_common.util.data import DataType, Ranges, Standardiser


class LIFXColour:
    '''
    Colour representation for LIFX including conversion from/to standard units used by PowerPi.
    '''

    __standardiser = Standardiser({
        # brightness is percentage we want unint16
        DataType.BRIGHTNESS: (
            lambda value: math.ceil((value / 100) * Ranges.UINT16.max),
            lambda value: round((value / Ranges.UINT16.max) * 100, 2),
            Ranges.UINT16
        ),
        # hue is 0-360 we want uint16
        DataType.HUE: (
            lambda value: math.ceil((value / 360) * Ranges.UINT16.max),
            lambda value: math.ceil((value / Ranges.UINT16.max) * 360),
            Ranges.UINT16
        ),
        # saturation is a percentage we want uint16
        DataType.SATURATION: (
            lambda value: math.ceil((value / 100) * Ranges.UINT16.max),
            lambda value: round((value / Ranges.UINT16.max) * 100),
            Ranges.UINT16
        ),
    })

    def __init__(self, colour: Tuple[int] or Dict[str, int]):
        if colour is None:
            self.hue = 0
            self.saturation = 0
            self.brightness = 0
            self.temperature = 0
        elif isinstance(colour, dict):
            self.hue = colour[DataType.HUE] if DataType.HUE in colour else 0
            self.saturation = colour[DataType.SATURATION] if DataType.SATURATION in colour else 0
            self.brightness = colour[DataType.BRIGHTNESS] if DataType.BRIGHTNESS in colour else 0
            self.temperature = colour[DataType.TEMPERATURE] if DataType.TEMPERATURE in colour else 0
        else:
            self.hue = colour[0]
            self.saturation = colour[1]
            self.brightness = colour[2]
            self.temperature = colour[3]

    @property
    def list(self):
        return (self.hue, self.saturation, self.brightness, self.temperature)

    @staticmethod
    def from_standard_unit(colour: Dict[str, float]):
        '''Convert colour from PowerPi standard units to LIFX'''

        converted = {key: LIFXColour.__standardiser.convert(key, value)
                     for key, value in colour.items()}

        return LIFXColour(converted)

    def to_standard_unit(self):
        '''Convert colour from LIFX units to PowerPi standard units and return as JSON'''
        return {
            DataType.HUE: self.__standardiser.revert(DataType.HUE, self.hue),
            DataType.SATURATION: self.__standardiser.revert(DataType.SATURATION, self.saturation),
            DataType.BRIGHTNESS: self.__standardiser.revert(DataType.BRIGHTNESS, self.brightness),
            DataType.TEMPERATURE: self.__standardiser.revert(
                DataType.TEMPERATURE, self.temperature
            )
        }

    def patch(self, colour: Dict[str, float or str]):
        if colour is not None:
            for key, value in colour.items():
                new_value = value

                if isinstance(value, str):
                    # handle an increment/decrement
                    if value.startswith('+') or value.startswith('-'):
                        # convert the old value back to the standard unit
                        old_value = self.__standardiser.revert(key, self[key])

                        # get the patch increment in standard unit
                        multiplier = -1 if value[0] == '-' else 1
                        patch_value = float(value[1:]) * multiplier

                        # add the increment to the old value in standard unit
                        new_value = old_value + patch_value

                    else:
                        new_value = float(value)

                # convert the value to LIFX unit
                self[key] = self.__standardiser.convert(key, new_value)

    def to_json(self):
        return {
            DataType.HUE: self.hue,
            DataType.SATURATION: self.saturation,
            DataType.BRIGHTNESS: self.brightness,
            DataType.TEMPERATURE: self.temperature
        }

    def __getitem__(self, key: DataType) -> int:
        if key == DataType.HUE:
            return self.hue
        if key == DataType.SATURATION:
            return self.saturation
        if key == DataType.BRIGHTNESS:
            return self.brightness
        if key == DataType.TEMPERATURE:
            return self.temperature

        raise KeyError(key)

    def __setitem__(self, key: DataType, value: int or str):
        if key == DataType.HUE:
            self.hue = value
        elif key == DataType.SATURATION:
            self.saturation = value
        elif key == DataType.BRIGHTNESS:
            self.brightness = value
        elif key == DataType.TEMPERATURE:
            self.temperature = value
        else:
            raise KeyError(key)

    def __str__(self):
        return f'HSBK({self.hue}, {self.saturation}, {self.brightness}, {self.temperature})'

    def __eq__(self, other):
        if isinstance(other, LIFXColour):
            return self.list == other.list

        return False
