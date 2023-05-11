import pytest
from pytest_mock import MockerFixture


@pytest.fixture
def powerpi_variable_manager(mocker: MockerFixture):
    manager = mocker.MagicMock()

    return manager
