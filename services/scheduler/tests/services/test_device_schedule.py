

from datetime import datetime
from types import MethodType
from typing import Any, Callable, Dict, List, Tuple
from unittest.mock import PropertyMock, patch

import pytest
from apscheduler.triggers.interval import IntervalTrigger
from scheduler.config import SchedulerConfig
from scheduler.services import DeviceSchedule


class TestDeviceSchedule:
    def test_start(
        self,
        subject_builder: Callable[[Dict[str, Any]], DeviceSchedule],
        scheduler_config: SchedulerConfig,
        add_job
    ):
        subject = subject_builder({
            'device': 'Some Device',
            'between': ['09:00:00', '09:30:00'],
            'interval': 60
        })

        type(scheduler_config).timezone = PropertyMock(
            return_value='Europe/London'
        )

        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, 18, 23, 1
            )
            subject.start()

        assert len(add_job) == 1
        job = add_job[0]

        assert job is not None
        assert job[0].__name__ == 'execute'

        assert job[1].start_date.hour == 9
        assert job[1].end_date.hour == 9
        assert job[1].end_date.minute == 30
        assert job[1].interval.seconds == 60

        assert job[2][0] == job[1].start_date
        assert job[2][1] == job[1].end_date

    @pytest.fixture
    def subject_builder(
        self,
        scheduler_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_scheduler
    ):
        # pylint: disable=too-many-arguments

        def build(schedule: Dict[str, Any]):
            return DeviceSchedule(
                scheduler_config,
                powerpi_logger,
                powerpi_mqtt_client,
                powerpi_scheduler,
                schedule
            )

        return build

    @pytest.fixture
    def add_job(self, powerpi_scheduler):
        job_results: List[Tuple[
            MethodType,
            IntervalTrigger,
            Tuple[datetime, datetime]
        ]] = []

        def add_job(
            method: MethodType,
            trigger: IntervalTrigger,
            args: Tuple[datetime, datetime],
            **_
        ):
            nonlocal job_results
            job_results.append((method, trigger, args))

        powerpi_scheduler.add_job = add_job

        return job_results
