from abc import ABC
from collections import namedtuple
from typing import Any, Dict

from powerpi_common.util.data import DataType, Range

Capability = namedtuple(
    'Capability',
    ['brightness', 'temperature', 'hue', 'saturation']
)


class CapabilityMixin(ABC):
    '''
    Mixin to add capability broadcast functionality to a device.
    '''

    @property
    def supports_brightness(self) -> bool:
        '''
        Override to indicate this device supports brightness or not.
        '''
        return False

    @property
    def supports_colour_temperature(self) -> Range | bool:
        '''
        Override to indicate this device supports colour temperature or not.
        '''
        return False

    @property
    def supports_colour_hue_and_saturation(self) -> bool:
        '''
        Override to indicate this device supports colour hue and saturation or not.
        '''
        return False

    def on_capability_change(self, capability: Dict[str, Any] | None = None):
        '''
        Call this method to broadcast the capabilities supported by this device,
        when that information becomes available.
        '''
        message = {} if capability is None else capability

        if self.supports_brightness:
            message['brightness'] = True

        colour = {}

        if self.supports_colour_hue_and_saturation:
            colour[DataType.HUE] = True
            colour[DataType.SATURATION] = True

        if isinstance(self.supports_colour_temperature, Range):
            temperature: Range = self.supports_colour_temperature

            colour[DataType.TEMPERATURE] = {
                'min': temperature.min,
                'max': temperature.max
            }

        if len(colour) > 0:
            message['colour'] = colour

        if len(message) > 0:
            self._broadcast('capability', message)
