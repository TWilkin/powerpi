from asyncio import Future

import pytest
from pytest_mock import MockerFixture


@pytest.fixture
def snapcast_api(mocker: MockerFixture):
    api = mocker.MagicMock()

    future = Future()
    future.set_result(True)

    api.connect.return_value = future
    api.disconnect.return_value = future

    return api
