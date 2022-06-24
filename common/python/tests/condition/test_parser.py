from typing import List

import pytest
from pytest_mock import MockerFixture

from powerpi_common.condition import ConditionParser, InvalidIdentifierException
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
        self.variable_manager = mocker.Mock()

        return ConditionParser(self.variable_manager)

    @pytest.mark.parametrize('data', [
        ['device.socket.state', 'socket'],
        ['device.light.brightness', 'light'],
        ['sensor.office.temperature.value', 'office/temperature'],
        ['sensor.office.temperature.unit', 'temperature/office']
    ])
    def test_identifier_success(self, mocker: MockerFixture, data: List[str]):
        (identifier, expected) = data

        subject = self.create_subject(mocker)

        self.variable_manager.get_device = DeviceVariableImpl
        self.variable_manager.get_sensor = SensorVariableImpl

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

        self.variable_manager.get_device = DeviceVariableImpl

        with pytest.raises(InvalidIdentifierException):
            subject.identifier(identifier)
