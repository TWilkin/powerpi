from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.device import DeviceNotFoundException
from scheduler.config import SchedulerConfig
from scheduler.services import DeviceScheduler


class TestDeviceScheduler:
    def test_start(
        self,
        subject: DeviceScheduler,
        scheduler_config: SchedulerConfig,
        device_schedule_factory: MagicMock
    ):
        devices = {
            'devices': [
                {'name': 'SomeDevice'}
            ]
        }

        schedules = {
            'timezone': 'Europe/London',
            'schedules': [
                {
                    'device': 'SomeDevice'
                }
            ]
        }

        type(scheduler_config).devices = PropertyMock(return_value=devices)
        type(scheduler_config).schedules = PropertyMock(return_value=schedules)

        subject.start()

        device_schedule_factory.assert_called_once_with(
            device_schedule={'device': 'SomeDevice'}
        )

    def test_start_no_config(
        self,
        subject: DeviceScheduler,
        scheduler_config: SchedulerConfig
    ):
        devices = {
            'devices': []
        }

        schedules = {
            'timezone': 'Europe/London',
            'schedules': []
        }

        type(scheduler_config).devices = PropertyMock(return_value=devices)
        type(scheduler_config).schedules = PropertyMock(return_value=schedules)

        subject.start()

    def test_start_missing_device(
        self,
        subject: DeviceScheduler,
        scheduler_config: SchedulerConfig
    ):
        devices = {
            'devices': []
        }

        schedules = {
            'timezone': 'Europe/London',
            'schedules': [
                {
                    'device': 'SomeDevice'
                }
            ]
        }

        type(scheduler_config).devices = PropertyMock(return_value=devices)
        type(scheduler_config).schedules = PropertyMock(return_value=schedules)

        with pytest.raises(DeviceNotFoundException):
            subject.start()

    @pytest.fixture
    def subject(
        self,
        scheduler_config,
        powerpi_logger,
        powerpi_service_provider
    ):
        return DeviceScheduler(
            scheduler_config,
            powerpi_logger,
            powerpi_service_provider
        )

    @pytest.fixture
    def device_schedule_factory(self, powerpi_service_provider):
        return powerpi_service_provider.device_schedule
