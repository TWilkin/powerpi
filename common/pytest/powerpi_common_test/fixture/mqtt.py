import pytest
from powerpi_common.mqtt import MQTTClient
from pytest_mock import MockerFixture

# pylint: disable=redefined-outer-name


@pytest.fixture
def powerpi_mqtt_client(mocker: MockerFixture):
    mqtt_client = mocker.MagicMock()

    return mqtt_client


@pytest.fixture
def powerpi_mqtt_producer(powerpi_mqtt_client: MQTTClient):
    return powerpi_mqtt_client.add_producer()
