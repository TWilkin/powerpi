from unittest.mock import MagicMock, call

import pytest
from pytest_mock import MockerFixture

from scheduler.services.device_schedule_factory import DeviceScheduleFactory


class TestDeviceScheduleFactory:
    def test_build_interval(
        self,
        subject: DeviceScheduleFactory,
        interval_factory: MagicMock,
        single_factory: MagicMock
    ):
        result = subject.build(
            'MyDevice', {'schedule': '* * * * *', 'duration': 600, 'interval': 300})

        assert result is not None
        assert result == 'Interval'

        assert interval_factory.call_count == 1
        assert interval_factory.call_args_list[0] == call(
            device='MyDevice',
            schedule='* * * * *',
            duration=600,
            interval=300
        )

        assert single_factory.call_count == 0

    def test_build_single(
        self,
        subject: DeviceScheduleFactory,
        interval_factory: MagicMock,
        single_factory: MagicMock
    ):
        result = subject.build(
            'MyDevice', {'schedule': '* * * * *'}
        )

        assert result is not None
        assert result == 'Single'

        assert single_factory.call_count == 1
        assert single_factory.call_args_list[0] == call(
            device='MyDevice',
            schedule='* * * * *'
        )

        assert interval_factory.call_count == 0

    @pytest.fixture
    def subject(
        self,
        powerpi_logger,
        interval_factory,
        single_factory
    ):
        return DeviceScheduleFactory(powerpi_logger, interval_factory, single_factory)

    @pytest.fixture
    def interval_factory(self, mocker: MockerFixture):
        factory = mocker.MagicMock()

        factory.return_value = 'Interval'

        return factory

    @pytest.fixture
    def single_factory(self, mocker: MockerFixture):
        factory = mocker.MagicMock()

        factory.return_value = 'Single'

        return factory
