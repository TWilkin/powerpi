from abc import ABC
from typing import TypedDict, Union

from powerpi_common.util.data import DataType, Range


class ColourCapability(TypedDict):
    '''
    Dictionary of colour capabilities.
    :param temperature: The range of the colour temperature, or none if not supported.
    :param hue: Whether colour uisng hue is supported.
    :param saturation: Whether colour using saturation is supported.
    '''
    temperature: Union[Range, bool]
    hue: bool
    saturation: bool


class Capability(TypedDict):
    '''
    Dictionary of device capabilities.
    :param brightness: Whether brightness level is supported.
    :param colour: The colour capabilities of the device.
    '''
    brightness: bool
    colour: ColourCapability


class CapabilityMixin(ABC):
    '''
    Mixin to add capability broadcast functionality to a device.
    '''

    def on_capability_change(self, capability: Capability):
        '''
        Call this method to broadcast the capabilities supported by this device,
        when that information becomes available.
        '''
        if len(capability) > 0:
            message = {}

            if DataType.BRIGHTNESS in capability:
                message['brightness'] = capability[DataType.BRIGHTNESS]

            if 'colour' in capability:
                colour = {}

                if DataType.HUE in capability['colour']:
                    colour[DataType.HUE] = capability['colour'][DataType.HUE]

                if DataType.SATURATION in capability['colour']:
                    colour[DataType.SATURATION] = capability['colour'][DataType.SATURATION]

                if DataType.TEMPERATURE in capability['colour']:
                    temperature = capability['colour'][DataType.TEMPERATURE]

                    if temperature is not False:
                        colour[DataType.TEMPERATURE] = {
                            'min': temperature.min,
                            'max': temperature.max
                        }
                    else:
                        colour[DataType.TEMPERATURE] = False

                if len(colour) > 0:
                    message['colour'] = colour

            self._broadcast('capability', message)
