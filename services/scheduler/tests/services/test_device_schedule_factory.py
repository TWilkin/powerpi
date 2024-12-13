import pytest
from pytest_mock import MockerFixture

from scheduler.services.device_schedule_factory import DeviceScheduleFactory


class TestDeviceScheduleFactory:
    def test_build_interval(
        self,
        subject: DeviceScheduleFactory
    ):
        result = subject.build(
            'MyDevice', {'between': ['09:00:00', '09:10:00'], 'interval': 300})

        assert result is not None
        assert result == 'Interval'

    def test_build_single(
        self,
        subject: DeviceScheduleFactory
    ):
        result = subject.build(
            'MyDevice', {'at': '09:00:00'})

        assert result is not None
        assert result == 'Single'

    def test_build_not_found(
            self,
            subject: DeviceScheduleFactory
    ):
        result = subject.build('MyDevice', {})

        assert result is None

    @ pytest.fixture
    def subject(
        self,
        powerpi_logger,
        interval_factory,
        single_factory
    ):
        return DeviceScheduleFactory(powerpi_logger, interval_factory, single_factory)

    @ pytest.fixture
    def interval_factory(self, mocker: MockerFixture):
        factory = mocker.MagicMock()

        factory.return_value = 'Interval'

        return factory

    @ pytest.fixture
    def single_factory(self, mocker: MockerFixture):
        factory = mocker.MagicMock()

        factory.return_value = 'Single'

        return factory
