

from collections import namedtuple
from datetime import datetime
from types import MethodType
from typing import Any, Callable, Dict, List, Tuple, Union
from unittest.mock import PropertyMock, patch

import pytest
from apscheduler.triggers.interval import IntervalTrigger
from scheduler.config import SchedulerConfig
from scheduler.services import DeviceSchedule

ExpectedTime = namedtuple('ExpectedTime', "day hour minute")


class TestDeviceSchedule:
    @pytest.mark.parametrize('data', [
        (
            '09:00:00', '09:30:00', None,
            ExpectedTime(2, 9, 0), ExpectedTime(2, 9, 30)
        ),
        (
            '18:30:00', '20:00:00', None,
            ExpectedTime(1, 18, 30), ExpectedTime(1, 20, 0)
        ),
        (
            '21:45:00', '00:00:00', None,
            ExpectedTime(1, 21, 45), ExpectedTime(2, 0, 0)
        ),
        (
            '01:45:00', '01:44:59', None,
            ExpectedTime(1, 1, 45), ExpectedTime(2, 1, 44)
        ),
        (
            '09:00:00', '09:30:00', ['Tuesday'],
            ExpectedTime(7, 9, 0), ExpectedTime(7, 9, 30)
        ),
        (
            '17:00:00', '19:00:00', ['Wednesday'],
            ExpectedTime(1, 17, 0), ExpectedTime(1, 19, 0)
        ),
    ])
    @pytest.mark.parametrize('interval', [1, 60])
    def test_start(
        self,
        subject_builder: Callable[[Dict[str, Any]], DeviceSchedule],
        scheduler_config: SchedulerConfig,
        add_job,
        data: Tuple[str, str, Union[List[int], None], ExpectedTime, ExpectedTime],
        interval: int
    ):
        # pylint: disable=too-many-arguments

        (start_time, end_time, days, expected_start, expected_end) = data

        subject = subject_builder({
            'device': 'Some Device',
            'between': [start_time, end_time],
            'days': days,
            'interval': interval
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

        assert job[1].start_date.day == expected_start.day
        assert job[1].start_date.hour == expected_start.hour
        assert job[1].start_date.minute == expected_start.minute

        assert job[1].end_date.day == expected_end.day
        assert job[1].end_date.hour == expected_end.hour
        assert job[1].end_date.minute == expected_end.minute

        assert job[1].interval.seconds == interval

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
