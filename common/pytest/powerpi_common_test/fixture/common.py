import pytest
from pytest_mock import MockerFixture


@pytest.fixture
def powerpi_config(mocker: MockerFixture):
    config = mocker.MagicMock()

    return config


@pytest.fixture
def powerpi_logger(mocker: MockerFixture):
    logger = mocker.MagicMock()

    return logger


@pytest.fixture
def powerpi_scheduler(mocker: MockerFixture):
    scheduler = mocker.MagicMock()

    return scheduler
