import pytest
from pytest_mock import MockerFixture


@pytest.fixture
def snapcast_api(mocker: MockerFixture):
    api = mocker.MagicMock()

    return api
