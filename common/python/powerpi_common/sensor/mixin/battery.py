from abc import ABC
from datetime import datetime
from typing import Union


class BatteryMixin(ABC):
    '''
    Mixin to add battery message broadcast functionality to a device/sensor.
    '''

    def __init__(self):
        self.__battery = {}

    def on_battery_change(self, level: int, charging: Union[bool, None] = None):
        '''
        Call this method to broadcast a new battery level, and whether it's charging for this
        device/sensor, but only if it's changed or the last message is too old.
        '''
        now = int(datetime.utcnow().timestamp() * 1000)

        if self.__battery is None \
                or self.__battery.get('timestamp', 0) < now - (60 * 60 * 1000) \
                or self.__battery.get('value') != level \
                or self.__battery.get('charging') != charging:
            message = {
                'value': level,
                'unit': '%'
            }

            if charging is not None:
                message['charging'] = charging

            self._broadcast('battery', message)

            self.__battery = message.copy()
            self.__battery['timestamp'] = now
