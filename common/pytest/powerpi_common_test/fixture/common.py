from unittest.mock import PropertyMock

from pytest_mock import MockerFixture

import pytest


@pytest.fixture
def powerpi_config(mocker: MockerFixture):
    config = mocker.MagicMock()

    type(config).message_age_cutoff = PropertyMock(return_value=120)

    return config


@pytest.fixture
def powerpi_logger(mocker: MockerFixture):
    logger = mocker.MagicMock()

    return logger


@pytest.fixture
def powerpi_scheduler(mocker: MockerFixture):
    scheduler = mocker.MagicMock()

    return scheduler


@pytest.fixture
def powerpi_service_provider(mocker: MockerFixture):
    service_provider = mocker.MagicMock()

    return service_provider
