from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime
from types import MethodType
from typing import Any, Callable, Dict, List, Tuple
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
from apscheduler.triggers.date import DateTrigger
from cron_converter import Cron
from powerpi_common.condition import ConditionParser, Expression
import pytz

from scheduler.services.device_single_schedule import DeviceSingleSchedule

SubjectBuilder = Callable[[Dict[str, Any]], DeviceSingleSchedule]

AddJobType = List[Tuple[
    MethodType,
    DateTrigger,
    Dict[str, datetime]
]]


@dataclass
class ExpectedTime:
    day: int
    hour: int
    minute: int


class TestDeviceSingleSchedule:
    __expected_topic = 'device/SomeDevice/change'

    @pytest.mark.parametrize('cron,now,expected', [
        (
            '0 9 * * *', None, ExpectedTime(2, 9, 0)
        ),
        (
            '30 18 * * *', None, ExpectedTime(1, 18, 30)
        ),
        (
            '0 9 * * 2', None, ExpectedTime(7, 9, 0)
        ),
        # day light savings
        # before change over (summer time)
        (
            '0 9 * * *', datetime(2023, 10, 27, 9, 0, 1),
            ExpectedTime(28, 8, 0)
        ),
        # after change over (summer -> winter time)
        (
            '0 9 * * *', datetime(2023, 10, 28, 9, 0, 1),
            ExpectedTime(29, 9, 0)
        ),
        # other way
        # before change over(winter time)
        (
            '0 9 * * *', datetime(2024, 3, 29, 9, 0, 1),
            ExpectedTime(30, 9, 0)
        ),
        # after change over (winter -> summer time)
        (
            '0 9 * * *',
            datetime(2024, 3, 30, 9, 0, 1),
            ExpectedTime(31, 8, 0)
        ),
    ])
    def test_start(
        self,
        subject_builder: SubjectBuilder,
        add_job: AddJobType,
        cron: str,
        now: datetime | None,
        expected: ExpectedTime
    ):
        # pylint: disable=too-many-arguments

        subject = subject_builder({
            'device': 'SomeDevice',
            'cron': cron
        })

        with patch_datetime(
            now if now is not None
            else datetime(2023, 3, 1, 18, 23, 1, tzinfo=pytz.UTC)
        ):
            subject.start()

        assert len(add_job) == 1
        job = add_job[0]

        assert job is not None
        assert job[0].__name__ == 'execute'

        assert job[1].run_date.day == expected.day
        assert job[1].run_date.hour == expected.hour
        assert job[1].run_date.minute == expected.minute
        assert job[1].run_date.tzinfo == pytz.UTC

    @pytest.mark.parametrize('condition,expected', [
        (None, True),
        ({'when': [{'equals': [True, True]}]}, True),
        ({'when': {'wrong'}}, False),
    ])
    def test_start_condition(
        self,
        subject_builder: SubjectBuilder,
        add_job: AddJobType,
        condition: Expression | None,
        expected: bool
    ):
        subject = subject_builder({
            'device': 'SomeDevice',
            'cron': '0 9 * * *',
            'condition': condition
        })

        with patch_datetime(datetime(2023, 3, 1, 18, 23, 1, tzinfo=pytz.UTC)):
            subject.start()

        # if the condition is valid we expected it to schedule
        assert (len(add_job) == 1) is expected

    @pytest.mark.asyncio
    @pytest.mark.parametrize('config,expected', [
        ({}, None),
        ({'power': True}, {'state': 'on'}),
        ({'power': False}, {'state': 'off'}),
        ({'brightness': 50}, {'brightness': 50}),
        ({'hue': 180}, {'hue': 180}),
        ({'saturation': 74}, {'saturation': 74}),
        ({'temperature': 2_000}, {'temperature': 2_000}),
        (
            {'hue': 270, 'saturation': 50, 'power': True, 'scene': 'SomeScene'},
            {'hue': 270, 'saturation': 50, 'state': 'on', 'scene': 'SomeScene'}
        ),
    ])
    async def test_execute(
        self,
        subject_builder: SubjectBuilder,
        add_job: AddJobType,
        powerpi_mqtt_producer: MagicMock,
        config: Dict[str, Any],
        expected: Dict[str, Any]
    ):
        # pylint: disable=too-many-arguments

        with patch_datetime(datetime(2023, 3, 1, 9, 1, tzinfo=pytz.UTC)):
            subject = subject_builder({
                'device': 'SomeDevice',
                'cron': '0 9 * * *',
                **config
            })

            await subject.execute()

        if expected is not None:
            powerpi_mqtt_producer.assert_called_once_with(
                self.__expected_topic, expected
            )
        else:
            powerpi_mqtt_producer.assert_not_called()

        # schedules the next job
        assert len(add_job) == 1
        job = add_job[0]

        assert job is not None
        assert job[0].__name__ == 'execute'

        assert job[1].run_date.day == 2
        assert job[1].run_date.hour == 9
        assert job[1].run_date.minute == 0
        assert job[1].run_date.tzinfo == pytz.UTC

    @pytest.fixture
    def subject_builder(
        self,
        scheduler_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_scheduler,
        powerpi_variable_manager,
        condition_parser_factory,
        cron_factory
    ) -> SubjectBuilder:
        # pylint: disable=too-many-arguments

        type(scheduler_config).timezone = PropertyMock(
            return_value='Europe/London'
        )

        def build(schedule: Dict[str, Any]):
            return DeviceSingleSchedule(
                scheduler_config,
                powerpi_logger,
                powerpi_mqtt_client,
                powerpi_scheduler,
                powerpi_variable_manager,
                condition_parser_factory,
                cron_factory,
                **schedule
            )

        return build

    @pytest.fixture
    def add_job(self, powerpi_scheduler):
        job_results: AddJobType = []

        def add_job(
            method: MethodType,
            trigger: DateTrigger,
            kwargs: Dict[str, datetime],
            **_
        ):
            nonlocal job_results
            job_results.append((method, trigger, kwargs))

        powerpi_scheduler.add_job = add_job

        return job_results

    @pytest.fixture
    def condition_parser_factory(self, powerpi_variable_manager):
        return lambda: ConditionParser(
            powerpi_variable_manager
        )

    @pytest.fixture
    def cron_factory(self):
        return Cron


@contextmanager
def patch_datetime(mock_now: datetime):
    def now(timezone=None):
        print(f'mocking: {mock_now} {timezone}')
        if timezone is not None:
            return mock_now.astimezone(timezone)

        return mock_now.astimezone(pytz.UTC)

    with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
        mock_datetime.now = now

        yield mock_datetime
