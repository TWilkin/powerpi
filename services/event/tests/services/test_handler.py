from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest
from powerpi_common.condition import ParseException
from powerpi_common.logger import Logger
from powerpi_common.variable import VariableManager
from pytest_mock import MockerFixture

from event.services.actions import Action
from event.services.handler import EventHandler


class TestEventHandler:
    def test_device(self, subject: EventHandler, device: MagicMock):
        assert subject.device == device

    def test_condition(self, subject: EventHandler):
        assert subject.condition == {'equals': [True]}

    def test_str(self, subject: EventHandler):
        assert f'{subject}' == 'Light:Action(some action)'

    def test_validate_success(self, subject: EventHandler):
        assert subject.validate() is True

    def test_validate_fail(self, subject: EventHandler):
        with patch_expression() as parser:
            parser.side_effect = ParseException()

            assert subject.validate() is False

    @pytest.mark.parametrize('condition', [True, False])
    def test_execute_condition_pass(
        self,
        subject: EventHandler,
        action: Action,
        device: MagicMock,
        condition: bool
    ):
        with patch_expression() as parser:
            parser.return_value = condition

            result = subject.execute({})

            assert result is condition

        print(action.call_args_list)

        if condition:
            action.execute.assert_called_once_with(device)
        else:
            action.execute.assert_not_called()

    def test_execute_condition_fail(self, subject: EventHandler, action: Action):
        with patch_expression() as parser:
            parser.side_effect = ParseException()

            result = subject.execute({})

            assert result is False

        action.execute.assert_not_called()

    @pytest.fixture
    def device(self):
        return 'Light'

    @pytest.fixture
    def action(self, mocker: MockerFixture):
        action = mocker.MagicMock()

        action.__str__.return_value = 'Action(some action)'

        return action

    @pytest.fixture
    def subject(
        self,
        powerpi_logger: Logger,
        powerpi_variable_manager: VariableManager,
        device: MagicMock,
        action: Action
    ):
        return EventHandler(
            powerpi_logger,
            powerpi_variable_manager,
            device,
            {'equals': [True]},
            action
        )


@contextmanager
def patch_expression():
    with patch('powerpi_common.condition.ConditionParser.conditional_expression') as parser:
        yield parser
