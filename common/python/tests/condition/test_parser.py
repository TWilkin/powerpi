from typing import List

import pytest
from pytest_mock import MockerFixture

from powerpi_common.condition import ConditionParser, InvalidArgumentException, \
    InvalidIdentifierException, UnexpectedTokenException
from powerpi_common.variable import SensorValue
from powerpi_common_test.base import BaseTest


class DeviceVariableImpl:
    def __init__(self, name: str):
        self.state = name
        self.additional_state = {'brightness': name}


class SensorVariableImpl:
    def __init__(self, name: str, action: str):
        self.value = SensorValue(f'{name}/{action}', f'{action}/{name}')


class TestConditionParser(BaseTest):
    def create_subject(self, mocker: MockerFixture):
        variable_manager = mocker.Mock()

        variable_manager.get_device = DeviceVariableImpl
        variable_manager.get_sensor = SensorVariableImpl

        message = {'timestamp': 1337}

        return ConditionParser(variable_manager, message)

    @pytest.mark.parametrize('constant', [
        'strING',
        10,
        10.23,
        True,
        None
    ])
    def test_constant_success(self, mocker: MockerFixture, constant: str):
        subject = self.create_subject(mocker)

        result = subject.constant(constant)

        assert result == constant

    def test_constant_invalid(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with pytest.raises(UnexpectedTokenException):
            subject.constant({'too-complex': True})

    @pytest.mark.parametrize('identifier,expected', [
        ('var.device.socket.state', 'socket'),
        ('var.device.light.brightness', 'light'),
        ('var.sensor.office.temperature.value', 'office/temperature'),
        ('var.sensor.office.temperature.unit', 'temperature/office'),
        ('var.message.timestamp', 1337),
        ('var.message.whatever', None),
    ])
    def test_identifier_success(self, mocker: MockerFixture, identifier: str, expected: str):
        subject = self.create_subject(mocker)

        result = subject.identifier(identifier)

        assert result == expected

    @pytest.mark.parametrize('identifier', [
        'socket',
        'var.socket',
        'device',
        'var.device',
        'var.device.socket',
        'var.device.socket.whatever',
        'sensor',
        'var.sensor',
        'var.sensor.office',
        'var.sensor.office.temperature',
        'var.sensor.office.temperature.whatever',
        'message',
        'var.message'
    ])
    def test_identifier_invalid(self, mocker: MockerFixture, identifier: str):
        subject = self.create_subject(mocker)

        with pytest.raises(InvalidIdentifierException):
            subject.identifier(identifier)

    @pytest.mark.parametrize('operand,expected', [
        (True, False),
        (False, True),
        (1, False),
        (0, True),
        ({'!': True}, True)
    ])
    def test_unary_expression_success(self, mocker: MockerFixture, operand, expected: bool):
        subject = self.create_subject(mocker)

        result = subject.unary_expression({'not': operand})

        assert result is expected

    def test_unary_expression_fail(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with pytest.raises(InvalidArgumentException):
            subject.unary_expression({'not': [1, 2]})

    @pytest.mark.parametrize('operator,values,expected', [
        ('>', [3, 2], True),
        ('>=', [2, 3], False),
        ('<', [2, 3], True),
        ('<=', [3, 2], False),
        ('greater than', [3, 2], True),
        ('greater than equal', [2, 3], False),
        ('less than', [2, 3], True),
        ('less than equal', [3, 2], False),
    ])
    def test_relational_expression_success(
        self, mocker: MockerFixture, operator: str, values: List, expected: bool
    ):
        subject = self.create_subject(mocker)

        result = subject.relational_expression({operator: values})

        assert result is expected

    @pytest.mark.parametrize('operator', ['>', '<', '>=', '<='])
    @pytest.mark.parametrize('values', [
        'not a list',
        [1, 2, 3]
    ])
    def test_relational_expression_fail(self, mocker: MockerFixture, operator: str, values: List):
        subject = self.create_subject(mocker)

        with pytest.raises(InvalidArgumentException):
            subject.relational_expression({operator: values})

    @pytest.mark.parametrize('values,expected', [
        ([1, 1.0], True),
        ([1.1, 1.0], False),
        ([1, 1.0, 'a'], False),
        ([True, True, 1], True),
        ([None, None], True),
        (['var.device.socket.state', 'socket'], True),
        (['var.sensor.office.temperature.unit', 'temperature/office'], True),
        ([{'not': False}, True], True),
        ([{'=': [1, 1.0]}, 1], True)
    ])
    def test_equality_expression_success(self, mocker: MockerFixture, values: List, expected: bool):
        subject = self.create_subject(mocker)

        result = subject.equality_expression({'equals': values})

        assert result is expected

    def test_equality_expression_fail(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

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
        self, mocker: MockerFixture, values: List, expected: bool
    ):
        subject = self.create_subject(mocker)

        result = subject.logical_and_expression({'and': values})

        assert result is expected

    def test_logical_and_expression_fail(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

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
        self, mocker: MockerFixture, values: List, expected: bool
    ):
        subject = self.create_subject(mocker)

        result = subject.logical_or_expression({'or': values})

        assert result is expected

    def test_logical_or_expression_fail(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with pytest.raises(InvalidArgumentException):
            subject.logical_or_expression({'or': 'not a list'})
