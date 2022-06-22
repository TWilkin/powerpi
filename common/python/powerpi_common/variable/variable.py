from abc import ABC, abstractmethod
from typing import Any, Dict

from powerpi_common.variable.types import VariableType


class Variable(ABC):
    '''
    Abstract base class for a variable, which can monitor a remote device or sensor to allow its
    state to be used when choosing to activate other devices.
    '''

    def __init__(self, name: str, **_):
        self._name = name

    @property
    def name(self):
        '''
        Returns the unique name identifier for this device/sensor.
        '''
        return self._name

    @property
    @abstractmethod
    def variable_type(self) -> VariableType:
        raise NotImplementedError

    @property
    @abstractmethod
    def json(self) -> Dict[str, Any]:
        raise NotImplementedError

    def __str__(self):
        return f'var.{self.variable_type}.{self._name}={self.json}'
