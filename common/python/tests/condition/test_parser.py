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

        return ConditionParser(variable_manager)

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
        ('sensor.office.temperature.unit', 'temperature/office')
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
        'sensor.office.temperature.whatever'
    ])
    def test_identifier_invalid(self, mocker: MockerFixture, identifier: str):
        subject = self.create_subject(mocker)

        with pytest.raises(InvalidIdentifierException):
            subject.identifier(identifier)

    @pytest.mark.parametrize('values,expected', [
        ([1, 1.0, '1'], True),
        ([1.1, 1.0], False),
        ([True, 'true', 1], True),
        (['device.socket.state', 'socket'], True),
        (['sensor.office.temperature.unit', 'temperature/office'], True),
        ([{'equals': [True]}, True], True),
        ([{'equals': ['a']}, 1], False)
    ])
    def test_equality_expression_success(self, mocker: MockerFixture, values: List, expected: bool):
        subject = self.create_subject(mocker)

        result = subject.equality_expression({'equals': values})

        assert result is expected

    def test_equality_expression_fail(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with pytest.raises(InvalidArgumentException):
            subject.equality_expression({'equals': 'not a list'})
