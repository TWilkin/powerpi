from unittest.mock import patch

import pytest
from pytest_mock import MockerFixture

from powerpi_common.condition import ParseException
from powerpi_common.event.handler import EventHandler
from powerpi_common_test.base import BaseTest


class TestEventHandler(BaseTest):
    pytestmark = pytest.mark.asyncio

    def create_subject(self, mocker: MockerFixture):
        #pylint: disable=attribute-defined-outside-init

        self.action = None

        async def action(device):
            self.action = device

        return EventHandler(
            mocker.Mock(),
            mocker.Mock(),
            'MyDevice',
            {'equals': [True]},
            action
        )

    def test_validate_success(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.validate() is True

    def test_validate_fail(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with patch('powerpi_common.condition.ConditionParser.conditional_expression') as parser:
            parser.side_effect = ParseException()

            assert subject.validate() is False

    @pytest.mark.parametrize('condition', [True, False])
    async def test_execute_condition_pass(self, mocker: MockerFixture, condition: bool):
        subject = self.create_subject(mocker)

        with patch('powerpi_common.condition.ConditionParser.conditional_expression') as parser:
            parser.return_value = condition

            result = await subject.execute({})

            assert result is condition

        assert self.action == ('MyDevice' if condition else None)

    async def test_execute_condition_fail(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        with patch('powerpi_common.condition.ConditionParser.conditional_expression') as parser:
            parser.side_effect = ParseException()

            result = await subject.execute({})

            assert result is False

        assert self.action is None
