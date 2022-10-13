from abc import ABC


class BatteryMixin(ABC):
    '''
    Mixing to add battery message broadcast functionality to a device/sensor.
    '''

    def on_battery_change(self, level: int):
        '''
        Call this method to broadcast a new battery level for this device/sensor.
        '''
        message = {
            'value': level,
            'unit': '%'
        }

        self._broadcast('battery', message)
