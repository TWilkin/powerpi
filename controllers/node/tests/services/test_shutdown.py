from unittest.mock import MagicMock, PropertyMock

import pytest
from node_controller.services.shutdown import ShutdownService
from powerpi_common.device import DeviceStatus
from powerpi_common_test.mqtt.mqtt import mock_producer
from pytest_mock import MockerFixture


class TestShutdownService:
    def test_shutdown(
        self,
        mock_mqtt_producer: MagicMock,
        subject: ShutdownService,
        mocker: MockerFixture
    ):
        device = mocker.Mock()
        type(device).name = PropertyMock(return_value='TestDevice')

        subject.shutdown(device)

        mock_mqtt_producer.assert_called_once_with(
            'device/TestDevice/change',
            {'state': DeviceStatus.OFF}
        )

    @pytest.fixture
    def subject(self, mock_mqtt_client: MagicMock, mocker: MockerFixture):
        return ShutdownService(mocker.Mock(), mock_mqtt_client)

    @pytest.fixture
    def mock_mqtt_client(self, mocker: MockerFixture):
        return mocker.Mock()

    @pytest.fixture
    def mock_mqtt_producer(self, mock_mqtt_client: MagicMock, mocker: MockerFixture):
        return mock_producer(mocker, mock_mqtt_client)
