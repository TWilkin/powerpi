from asyncio import Future

import pytest
from pytest_mock import MockerFixture


@pytest.fixture
def harmony_client(mocker: MockerFixture):
    client = mocker.MagicMock()

    future = Future()
    future.set_result(None)
    for method in ['get_current_activity', 'start_activity', 'power_off']:
        mocker.patch.object(
            client,
            method,
            return_value=future
        )

    return client
