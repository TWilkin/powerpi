from typing import Any, Callable, Dict, List

import pytest

from powerpi_common.condition import (ConditionParser,
                                      InvalidArgumentException,
                                      InvalidIdentifierException,
                                      UnexpectedTokenException)
from powerpi_common.variable import SensorValue


class DeviceVariableImpl:
    def __init__(self, name: str):
        self.state = name
        self.additional_state = {'brightness': name}
        self.scene = 'movie'


class SensorVariableImpl:
    def __init__(self, name: str, action: str):
        self.value = SensorValue(f'{name}/{action}', f'{action}/{name}')


SubjectBuilder = Callable[[Dict[str, Any] | None], ConditionParser]


class TestConditionParser:

    @pytest.mark.parametrize('constant', [
        'strING',
        10,
        10.23,
        True,
        None
    ])
    def test_constant_success(self, subject: ConditionParser, constant: str):
        result = subject.constant(constant)

        assert result == constant

    def test_constant_invalid(self, subject: ConditionParser):
        with pytest.raises(UnexpectedTokenException):
            subject.constant({'too-complex': True})

    @pytest.mark.parametrize('identifier,expected', [
        ('device.socket.state', 'socket'),
        ('device.light.scene', 'movie'),
        ('device.light.brightness', 'light'),
        ('sensor.office.temperature.value', 'office/temperature'),
        ('sensor.office.temperature.unit', 'temperature/office'),
        ('message.timestamp', 1337),
        ('message.whatever', None),
    ])
    def test_identifier_success(
        self,
        subject_builder: SubjectBuilder,
        identifier: str,
        expected: str
    ):
        message = {'timestamp': 1337}

        subject = subject_builder(message)

        result = subject.identifier({'var': identifier})

        assert result == expected

    @pytest.mark.parametrize('identifier', [
        'socket',
        'device',
        'device.socket',
        'device.socket.whatever',
        'sensor',
        'sensor.office',
        'sensor.office.temperature',
        'sensor.office.temperature.whatever',
        'message',
        'message.timestamp'
    ])
    def test_identifier_invalid(self, subject: ConditionParser, identifier: str):
        with pytest.raises(InvalidIdentifierException):
            subject.identifier({'var': identifier})

    @pytest.mark.parametrize('identifier', [
        'sensor.office.temperature.state',
        'sensor.office.temperature.value',
        'sensor.office.temperature.unit'
    ])
    def test_sensor_identifier_invalid(
        self,
        subject: ConditionParser,
        powerpi_variable_manager,
        identifier: str
    ):
        class NoValueSensor:
            pass

        powerpi_variable_manager.get_sensor = lambda _, __: NoValueSensor

        with pytest.raises(InvalidIdentifierException):
            subject.identifier({'var': identifier})

    def test_identifier_fail(self, subject: ConditionParser):
        with pytest.raises(InvalidArgumentException):
            subject.identifier({'var': ['message.timestamp', 'message.state']})

    @pytest.mark.parametrize('operand,expected', [
        (True, False),
        (False, True),
        (1, False),
        (0, True),
        ({'!': True}, True)
    ])
    def test_unary_expression_success(self, subject: ConditionParser, operand, expected: bool):
        result = subject.unary_expression({'not': operand})

        assert result is expected

    def test_unary_expression_fail(self, subject: ConditionParser):
        with pytest.raises(InvalidArgumentException):
            subject.unary_expression({'not': [1, 2]})

    @pytest.mark.parametrize('operator,values,expected', [
        ('>', [3, 2], True),
        ('>=', [2, 3], False),
        ('<', [2, 3], True),
        ('<=', [3, 2], False),
        ('greater_than', [3, 2], True),
        ('greater_than_equal', [2, 3], False),
        ('less_than', [2, 3], True),
        ('less_than_equal', [3, 2], False),
    ])
    def test_relational_expression_success(
        self, subject: ConditionParser, operator: str, values: List, expected: bool
    ):
        result = subject.relational_expression({operator: values})

        assert result is expected

    @pytest.mark.parametrize('operator', ['>', '<', '>=', '<='])
    @pytest.mark.parametrize('values', [
        'not a list',
        [1, 2, 3]
    ])
    def test_relational_expression_fail(
        self, subject: ConditionParser, operator: str, values: List
    ):
        with pytest.raises(InvalidArgumentException):
            subject.relational_expression({operator: values})

    @pytest.mark.parametrize('values,expected', [
        ([1, 1.0], True),
        ([1.1, 1.0], False),
        ([1, 1.0, 'a'], False),
        ([True, True, 1], True),
        ([None, None], True),
        ([{'var': 'device.socket.state'}, 'socket'], True),
        ([{'var': 'sensor.office.temperature.unit'}, 'temperature/office'], True),
        ([{'not': False}, True], True),
        ([{'=': [1, 1.0]}, 1], True)
    ])
    def test_equality_expression_success(self, subject: ConditionParser, values: List, expected: bool):
        result = subject.equality_expression({'equals': values})

        assert result is expected

    def test_equality_expression_fail(self, subject: ConditionParser,):
        with pytest.raises(InvalidArgumentException):
            subject.equality_expression({'equals': 'not a list'})

    @pytest.mark.parametrize('values,expected', [
        ([True, True], True),
        ([True, False], False),
        ([True, True, True, False], False),
        ([{'&': [True, True]}, True], True),
        ([{'not': False}, True], True),
        ([True, {'either': [False, True]}], True)
    ])
    def test_logical_and_expression_success(
        self, subject: ConditionParser, values: List, expected: bool
    ):
        result = subject.logical_and_expression({'and': values})

        assert result is expected

    def test_logical_and_expression_fail(self, subject: ConditionParser):
        with pytest.raises(InvalidArgumentException):
            subject.logical_and_expression({'and': 'not a list'})

    @pytest.mark.parametrize('values,expected', [
        ([True, True], True),
        ([True, False], True),
        ([True, True, True, False], True),
        ([False, False], False),
        ([{'|': [False, True]}, False], True),
        ([{'not': True}, False], False)
    ])
    def test_logical_or_expression_success(
        self, subject: ConditionParser, values: List, expected: bool
    ):
        result = subject.logical_or_expression({'or': values})

        assert result is expected

    def test_logical_or_expression_fail(self, subject: ConditionParser):
        with pytest.raises(InvalidArgumentException):
            subject.logical_or_expression({'or': 'not a list'})

    @pytest.fixture
    def subject_builder(self, powerpi_variable_manager):
        def build(message: Dict[str, Any] | None = None):
            powerpi_variable_manager.get_device = DeviceVariableImpl
            powerpi_variable_manager.get_sensor = SensorVariableImpl

            return ConditionParser(powerpi_variable_manager, message)

        return build

    @pytest.fixture
    def subject(self, subject_builder: SubjectBuilder):
        return subject_builder()
