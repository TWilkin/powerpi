from unittest.mock import patch

import pytest

from powerpi_common.condition import ParseException
from powerpi_common.event.handler import EventHandler


class TestEventHandler:

    __action = None

    def test_validate_success(self, subject: EventHandler):
        assert subject.validate() is True

    def test_validate_fail(self, subject: EventHandler):
        with patch('powerpi_common.condition.ConditionParser.conditional_expression') as parser:
            parser.side_effect = ParseException()

            assert subject.validate() is False

    @pytest.mark.asyncio
    @pytest.mark.parametrize('condition', [True, False])
    async def test_execute_condition_pass(self, subject: EventHandler, condition: bool):
        with patch('powerpi_common.condition.ConditionParser.conditional_expression') as parser:
            parser.return_value = condition

            result = await subject.execute({})

            assert result is condition

        assert self.__action == ('MyDevice' if condition else None)

    @pytest.mark.asyncio
    async def test_execute_condition_fail(self, subject: EventHandler):
        with patch('powerpi_common.condition.ConditionParser.conditional_expression') as parser:
            parser.side_effect = ParseException()

            result = await subject.execute({})

            assert result is False

        assert self.__action is None

    @pytest.fixture
    def subject(self, powerpi_logger, powerpi_variable_manager):
        async def action(device):
            self.__action = device

        return EventHandler(
            powerpi_logger,
            powerpi_variable_manager,
            'MyDevice',
            {'equals': [True]},
            action
        )
