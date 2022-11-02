from abc import ABC, abstractmethod
from collections import OrderedDict
from typing import Dict, List

from powerpi_common.device.mixin import InitialisableMixin


class PWMFanInterface(InitialisableMixin, ABC):
    @property
    @abstractmethod
    def curve(self) -> OrderedDict[int, int]:
        '''
        Get the PWM fan control curve.
        '''
        raise NotImplementedError

    @curve.setter
    def curve(self, new_value: Dict[int, int]):
        '''
        Set the PWM fan control curve.
        '''
        raise NotImplementedError

    @property
    def cpu_temps(self) -> List[float]:
        '''
        Get the CPU temperature readings since the last clear.
        '''
        raise NotImplementedError

    @property
    def battery_temps(self) -> List[float]:
        '''
        Get the battery temperature readings since the last clear.
        '''
        raise NotImplementedError

    @property
    def fan_speeds(self) -> List[float]:
        '''
        Get the fan speed readings since the last clear.
        '''
        raise NotImplementedError

    def clear(self):
        '''
        Reset the captured temperatures and speeds, as we're getting an average
        '''
        raise NotImplementedError
