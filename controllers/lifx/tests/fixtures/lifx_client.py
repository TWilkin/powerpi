from asyncio import Future

import pytest
from lifx_controller.device.lifx_colour import LIFXColour
from pytest_mock import MockerFixture


@pytest.fixture
def lifx_client(mocker: MockerFixture):
    client = mocker.Mock()

    future = Future()
    future.set_result((False, LIFXColour((0, 0, 0, 0))))
    mocker.patch.object(
        client,
        'get_state',
        return_value=future
    )

    future = Future()
    future.set_result(True)
    mocker.patch.object(
        client,
        'set_power',
        return_value=future
    )

    mocker.patch.object(
        client,
        'set_colour',
        return_value=future
    )

    return client
