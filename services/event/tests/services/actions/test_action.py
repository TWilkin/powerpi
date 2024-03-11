from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from event.services.actions.action import Action


class TestAction:
    def test_action_type(self, subject: Action):
        assert subject.action_type == 'some_action'

    def test_execute(self, subject: Action, action: MagicMock):
        device = 'my device'

        subject.execute(device)

        action.assert_called_once_with(device)

    def test_str(self, subject: Action):
        assert f'{subject}' == 'Action(some_action)'

    @pytest.fixture
    def action(self, mocker: MockerFixture):
        return mocker.MagicMock()

    @pytest.fixture
    def subject(self, action: MagicMock):
        return Action('some_action', action)
