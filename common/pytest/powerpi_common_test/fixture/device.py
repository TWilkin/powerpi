from pytest_mock import MockerFixture

import pytest


@pytest.fixture
def powerpi_device_manager(mocker: MockerFixture):
    manager = mocker.MagicMock()

    return manager
