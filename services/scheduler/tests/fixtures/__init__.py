import pytest
from pytest_mock import MockerFixture


@pytest.fixture
def scheduler_config(powerpi_config):
    return powerpi_config
