from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from network_controller.sensor.presence import PresenceSensor
from network_controller.services.arp import ARPProviderFactory


class TestARPProviderFactory:

    def test_no_sensors(
        self,
        subject: ARPProviderFactory,
        powerpi_device_manager: MagicMock,
    ):
        powerpi_device_manager.sensors = {}

        result = subject.get_arp_service()

        assert result is None

    def test_no_presence_sensors(
        self,
        subject: ARPProviderFactory,
        powerpi_device_manager: MagicMock,
        mocker: MockerFixture,
    ):
        powerpi_device_manager.sensors = {
            'other': mocker.MagicMock(),
        }

        result = subject.get_arp_service()

        assert result is None

    def test_has_presence_sensor(
        self,
        subject: ARPProviderFactory,
        powerpi_device_manager: MagicMock,
        powerpi_service_provider: MagicMock,
        mocker: MockerFixture,
    ):
        powerpi_device_manager.sensors = {
            'presence': mocker.MagicMock(spec=PresenceSensor),
        }

        result = subject.get_arp_service()

        assert result is powerpi_service_provider.packet_arp_provider()

    @pytest.fixture
    def subject(
        self,
        powerpi_logger,
        powerpi_device_manager,
        powerpi_service_provider,
    ) -> ARPProviderFactory:
        return ARPProviderFactory(
            powerpi_logger,
            powerpi_device_manager,
            powerpi_service_provider,
        )
