from typing import List
from powerpi_common.condition.parser import InvalidIdentifierException

import pytest
from pytest_mock import MockerFixture

from powerpi_common.condition import ConditionParser
from powerpi_common_test.base import BaseTest


class TestConditionParser(BaseTest):
    def create_subject(self, mocker: MockerFixture):
        self.variable_manager = mocker.Mock()

        return ConditionParser(self.variable_manager)

    @pytest.mark.parametrize('data', [
        ['device.socket', 'socket'],
        ['sensor.office.temperature', 'office/temperature']
    ])
    def test_identifier_success(self, mocker: MockerFixture, data: List[str]):
        (identifier, expected) = data

        subject = self.create_subject(mocker)

        self.variable_manager.get_device = lambda name: name
        self.variable_manager.get_sensor = lambda name, action: f'{name}/{action}'

        result = subject.identifier(identifier)

        assert result is not None
        assert result == expected

    @pytest.mark.parametrize('identifier', [
        'socket',
        'device',
        'device.socket.whatever',
        'sensor',
        'sensor.office',
        'sensor.office.temperature.whatever'
    ])
    def test_identifier_invalid(self, mocker: MockerFixture, identifier: str):
        subject = self.create_subject(mocker)

        with pytest.raises(InvalidIdentifierException):
            subject.identifier(identifier)
