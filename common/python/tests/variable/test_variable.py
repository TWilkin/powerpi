import pytest
from powerpi_common_test.variable import VariableTestBaseNew

from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


class VariableImpl(Variable):
    @property
    def variable_type(self):
        return VariableType.DEVICE

    @property
    def json(self):
        return {}

    @property
    def suffix(self):
        return self._name


class TestVariable(VariableTestBaseNew):

    @pytest.fixture
    def subject(self):
        return VariableImpl('TestVariable')
