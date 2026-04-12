from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


class PresenceVariable(Variable):
    def __init__(
        self,
        name: str,
        **kwargs
    ):
        Variable.__init__(self, name, **kwargs)

        self.__state = None

    @property
    def variable_type(self):
        return VariableType.PRESENCE

    @property
    def state(self):
        return self.__state

    @state.setter
    def state(self, new_state: str):
        self.__state = new_state

    @property
    def json(self):
        return {'state': self.__state}

    @property
    def suffix(self):
        return f'{self._name}'
