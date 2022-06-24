from typing import List, Union

import pytest
from pytest_mock import MockerFixture

from powerpi_common.condition import ConditionParser, InvalidArgumentException, \
    InvalidIdentifierException
from powerpi_common_test.base import BaseTest


class DeviceVariableImpl:
    def __init__(self, name: str):
        self.state = name
        self.additional_state = {'brightness': name}


class SensorVariableImpl:
    def __init__(self, name: str, action: str):
        self.value = f'{name}/{action}'
        self.unit = f'{action}/{name}'


class TestConditionParser(BaseTest):
    def create_subject(self, mocker: MockerFixture):
        variable_manager = mocker.Mock()

        variable_manager.get_device = DeviceVariableImpl
        variable_manager.get_sensor = SensorVariableImpl

        message = {'timestamp': 1337}

        return ConditionParser(variable_manager, message)

    @pytest.mark.parametrize('constant,expected', [
        ('strING', 'strING'),
        ('10', 10),
        ('10.23', 10.23),
        ('true', True),
        ('FALSE', False),
    ])
    def test_constant(self, mocker: MockerFixture, constant: str, expected: Union[str, float]):
        subject = self.create_subject(mocker)

        result = subject.constant(constant)

        assert result is not None
        assert result == expected

    @pytest.mark.parametrize('identifier,expected', [
        ('device.socket.state', 'socket'),
        ('device.light.brightness', 'light'),
        ('sensor.office.temperature.value', 'office/temperature'),
        ('sensor.office.temperature.unit', 'temperature/office'),
        ('message.timestamp', 1337)
    ])
    def test_identifier_success(self, mocker: MockerFixture, identifier: str, expected: str):
        subject = self.create_subject(mocker)

        result = subject.identifier(identifier)

        assert result is not None
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
        'message.whatever'
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
    def test_unary_expression(self, mocker: MockerFixture, operand, expected: bool):
        subject = self.create_subject(mocker)

        result = subject.unary_expression({'not': operand})

        assert result is expected

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
        ([1, 1.0, '1'], True),
        ([1.1, 1.0], False),
        ([1, 1.0, 'a'], False),
        ([True, 'true', 1], True),
        (['device.socket.state', 'socket'], True),
        (['sensor.office.temperature.unit', 'temperature/office'], True),
        ([{'not': False}, True], True),
        ([{'=': [1, 1.0]}, '1'], True)
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
        ([{'not': False}, True], True)
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
