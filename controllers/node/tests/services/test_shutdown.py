from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.device import DeviceStatus
from pytest_mock import MockerFixture

from node_controller.services.shutdown import ShutdownService


class TestShutdownService:
    def test_shutdown(
        self,
        powerpi_mqtt_producer: MagicMock,
        subject: ShutdownService,
        mocker: MockerFixture
    ):
        device = mocker.Mock()
        type(device).name = PropertyMock(return_value='TestDevice')

        subject.shutdown(device)

        powerpi_mqtt_producer.assert_called_once_with(
            'device/TestDevice/change',
            {'state': DeviceStatus.OFF}
        )

    @pytest.fixture
    def subject(self, powerpi_logger, powerpi_mqtt_client):
        return ShutdownService(powerpi_logger, powerpi_mqtt_client)
