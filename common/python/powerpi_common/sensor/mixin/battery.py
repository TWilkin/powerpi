from abc import ABC
from typing import Union


class BatteryMixin(ABC):
    '''
    Mixing to add battery message broadcast functionality to a device/sensor.
    '''

    def on_battery_change(self, level: int, charging: Union[bool, None] = None):
        '''
        Call this method to broadcast a new battery level, and whether it's charging for this device/sensor.
        '''
        message = {
            'value': level,
            'unit': '%'
        }

        if charging is not None:
            message['charging'] = charging

        self._broadcast('battery', message)
