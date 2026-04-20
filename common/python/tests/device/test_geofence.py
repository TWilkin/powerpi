from unittest.mock import MagicMock, PropertyMock

import pytest
from pytest_mock import MockerFixture

from powerpi_common.device.geofence import Geofence


class TestGeofence:

    def test_active_on(self, subject: Geofence, sensor: MagicMock):
        type(sensor).state = PropertyMock(return_value='on')

        assert subject.active is True

    def test_active_off(self, subject: Geofence, sensor: MagicMock):
        type(sensor).state = PropertyMock(return_value='off')

        assert subject.active is False

    def test_active_unknown(self, subject: Geofence, sensor: MagicMock):
        type(sensor).state = PropertyMock(return_value='unknown')

        assert subject.active is False

    def test_active_sensor_not_found(self, powerpi_variable_manager):
        subject = Geofence(powerpi_variable_manager, 'OtherGeofence')
        assert subject.active is True

    def test_active_no_sensor_configured(self, powerpi_variable_manager):
        subject = Geofence(powerpi_variable_manager, None)

        assert subject.active is False

    @pytest.fixture
    def subject(self, powerpi_variable_manager):
        return Geofence(powerpi_variable_manager, 'TestGeofence')

    @pytest.fixture(autouse=True)
    def sensor(
        self,
        powerpi_variable_manager,
        mocker: MockerFixture
    ):
        sensor = mocker.MagicMock()

        powerpi_variable_manager.get_geofence = \
            lambda name: sensor if name == 'TestGeofence' else None

        return sensor
