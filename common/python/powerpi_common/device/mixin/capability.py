from abc import ABC
from typing import TypedDict, Union

from powerpi_common.util.data import Range


class ColourCapability(TypedDict):
    '''
    Dictionary of colour capabilities.
    :param temperature: The range of the colour temperature, or none if not supported.
    :param hue: Whether colour uisng hue is supported.
    :param saturation: Whether colour using saturation is supported.
    '''
    temperature: Union[Range, None]
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
        self._broadcast('capability', capability)
