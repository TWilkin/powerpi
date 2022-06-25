from pytest_mock import MockerFixture

from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable
from powerpi_common_test.variable import VariableTestBase


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


class TestVariable(VariableTestBase):
    def create_subject(self, _: MockerFixture):
        return VariableImpl('TestVariable')
