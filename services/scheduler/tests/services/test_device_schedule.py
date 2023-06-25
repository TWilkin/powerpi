from dataclasses import dataclass
from datetime import datetime
from types import MethodType
from typing import Any, Callable, Dict, List, Optional, Tuple
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
import pytz
from apscheduler.triggers.interval import IntervalTrigger
from powerpi_common.condition import ConditionParser, Expression
from pytest_mock import MockerFixture

from scheduler.services import DeviceSchedule

SubjectBuilder = Callable[[Dict[str, Any]], DeviceSchedule]


@dataclass
class ExpectedTime:
    day: int
    hour: int
    minute: int


class TestDeviceSchedule:
    @pytest.mark.parametrize('start_time,end_time,days,expected_start,expected_end', [
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
        subject_builder: SubjectBuilder,
        add_job,
        start_time: str,
        end_time: str,
        days: Optional[List[str]],
        expected_start: ExpectedTime,
        expected_end: ExpectedTime,
        interval: List[int]
    ):
        # pylint: disable=too-many-arguments

        subject = subject_builder({
            'device': 'SomeDevice',
            'between': [start_time, end_time],
            'days': days,
            'interval': interval
        })

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

    @pytest.mark.parametrize('condition,expected', [
        (None, True),
        ({'when': [{'equals': [True, True]}]}, True),
        ({'when': {'wrong'}}, False),
    ])
    def test_start_condition(
        self,
        subject_builder: SubjectBuilder,
        add_job,
        condition: Optional[Expression],
        expected: bool
    ):
        subject = subject_builder({
            'device': 'SomeDevice',
            'between': ['09:00:00', '10:00:00'],
            'interval': 60,
            'condition': condition
        })

        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, 18, 23, 1
            )
            subject.start()

        # if the condition is valid we expected it to schedule
        assert (len(add_job) == 1) is expected

    @pytest.mark.asyncio
    @pytest.mark.parametrize('config,expected', [
        ({}, None),
        ({'power': True}, {'state': 'on'}),
        ({'brightness': [0, 50]}, {'brightness': 1}),
        ({'temperature': [1000, 2000]}, {'temperature': 1020}),
        ({'hue': [0, 360]}, {'hue': 7}),
        ({'saturation': [0, 1]}, {'saturation': 0.02}),
        (
            {
                'power': False,
                'scene': 'other',
                'brightness': [0, 100],
                'temperature': [2000, 4000]
            },
            {
                'scene': 'other',
                'brightness': 2,
                'temperature': 2040,
                'state': 'off'
            }
        )
    ])
    async def test_execute(
        self,
        subject_builder: SubjectBuilder,
        add_job,
        powerpi_mqtt_producer: MagicMock,
        config: Dict[str, Any],
        expected: Dict[str, Any]
    ):
        # pylint: disable=too-many-arguments

        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, 9, 1
            )

            subject = subject_builder({
                'device': 'SomeDevice',
                'between': ['09:00:00', '09:50:00'],
                'interval': 60,
                **config
            })

            start_date = datetime(2023, 3, 1, 9, 00)
            end_date = datetime(2023, 3, 1, 9, 50)

            await subject.execute(start_date, end_date)

        # it's not the last run
        assert len(add_job) == 0

        if expected is not None:
            topic = 'device/SomeDevice/change'
            powerpi_mqtt_producer.assert_called_once_with(topic, expected)
        else:
            powerpi_mqtt_producer.assert_not_called()

    # @pytest.mark.asyncio
    # @pytest.mark.parametrize('brightness,hour,minute,expected', [
    #     ([0, 100], 8, 55, 0),
    #     ([100, 0], 8, 55, 100),
    #     ([0, 100], 10, 1, 100),
    #     ([100, 0], 10, 1, 0)
    # ])
    # async def test_execute_round(
    #     self,
    #     subject_builder: SubjectBuilder,
    #     powerpi_mqtt_producer: MagicMock,
    #     brightness: List[int],
    #     hour: int,
    #     minute: int,
    #     expected: int
    # ):
    #     # pylint: disable=too-many-arguments

    #     with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
    #         mock_datetime.now.return_value = datetime(
    #             2023, 3, 1, hour, minute
    #         ).astimezone(pytz.UTC)

    #         subject = subject_builder({
    #             'device': 'SomeDevice',
    #             'between': ['09:10:00', '10:00:00'],
    #             'interval': 60,
    #             'brightness': brightness
    #         })

    #         start_date = datetime(2023, 3, 1, 9, 10)
    #         end_date = datetime(2023, 3, 1, 10, 0).astimezone(pytz.UTC)

    #         await subject.execute(start_date, end_date)

    #     message = {
    #         'brightness': expected
    #     }

    #     topic = 'device/SomeDevice/change'
    #     powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.mark.asyncio
    async def test_execute_schedule_next(
        self,
        subject_builder: SubjectBuilder,
        add_job,
    ):
        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, 9, 30, 1
            ).astimezone(pytz.UTC)

            subject = subject_builder({
                'device': 'SomeDevice',
                'between': ['09:00:00', '09:30:00'],
                'interval': 60
            })

            start_date = datetime(2023, 3, 1, 9, 00)
            end_date = datetime(2023, 3, 1, 9, 30).astimezone(pytz.UTC)

            await subject.execute(start_date, end_date)

        assert len(add_job) == 1

        job = add_job[0]

        assert job is not None
        assert job[0].__name__ == 'execute'

        assert job[1].start_date.day == 2
        assert job[1].start_date.hour == 9
        assert job[1].start_date.minute == 0

        assert job[1].end_date.day == 2
        assert job[1].end_date.hour == 9
        assert job[1].end_date.minute == 30

        assert job[1].interval.seconds == 60

        assert job[2][0] == job[1].start_date
        assert job[2][1] == job[1].end_date

    @pytest.mark.asyncio
    @pytest.mark.parametrize('brightness,current,expected,next_expected', [
        ([0, 100], 50, 50 + 1.67, 50 + 1.67 * 2),
        ([100, 0], 50, 50 - 1.67, 50 - 1.67 * 2),
        ([0, 100], 0, 3.33, 3.33 * 2),
        ([100, 0], 100, 100 - 3.33, 100 - 3.33 * 2),
        ([0, 100], 100, 100, 100),
        ([100, 0], 0, 0, 0),
        ([10, 60], 10 + 20, 10 + 21, 10 + 22),
        ([60, 10], 60 - 20, 60 - 21, 60 - 22)
    ])
    async def test_execute_current_value(
        self,
        subject_builder: SubjectBuilder,
        powerpi_mqtt_producer: MagicMock,
        powerpi_variable_manager: MagicMock,
        mocker: MockerFixture,
        brightness: List[int],
        current: float,
        expected: float,
        next_expected: float
    ):
        # pylint: disable=too-many-arguments,too-many-locals

        variable = mocker.MagicMock()
        powerpi_variable_manager.get_device = lambda _: variable

        subject = subject_builder({
            'device': 'SomeDevice',
            'between': ['09:10:00', '10:00:00'],
            'interval': 60,
            'brightness': brightness
        })

        async def execute(minutes: float, current: float, expected: float):
            type(variable).additional_state = PropertyMock(
                return_value={'brightness': current}
            )

            with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
                mock_datetime.now.return_value = datetime(
                    2023, 3, 1, 9, minutes
                ).astimezone(pytz.UTC)

                start_date = datetime(2023, 3, 1, 9, 10)
                end_date = datetime(2023, 3, 1, 10, 0).astimezone(pytz.UTC)

                await subject.execute(start_date, end_date)

            topic = 'device/SomeDevice/change'
            message = {'brightness': expected}
            powerpi_mqtt_producer.assert_called_once_with(topic, message)

        # run it once
        await execute(31, current, expected)

        # run it again for the next interval
        powerpi_mqtt_producer.reset_mock()

        await execute(32, expected, next_expected)

    @pytest.mark.asyncio
    @pytest.mark.parametrize('set_condition,current_state,expected', [
        (True, 'on', True),
        (True, 'off', False),
        (False, 'off', True)
    ])
    async def test_execute_condition(
        self,
        subject_builder: SubjectBuilder,
        powerpi_mqtt_producer: MagicMock,
        powerpi_variable_manager: MagicMock,
        mocker: MockerFixture,
        set_condition: bool,
        current_state: str,
        expected: bool
    ):
        # pylint: disable=too-many-arguments

        variable = mocker.MagicMock()
        powerpi_variable_manager.get_device = lambda _: variable

        type(variable).state = PropertyMock(
            return_value=current_state
        )

        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, 9, 31
            ).astimezone(pytz.UTC)

            subject = subject_builder({
                'device': 'SomeDevice',
                'between': ['09:10:00', '10:00:00'],
                'interval': 60,
                'brightness': [0, 100],
                'condition': None if not set_condition
                else {'when': [{'equals': [{'var': 'device.Test.state'}, 'on']}]}
            })

            start_date = datetime(2023, 3, 1, 9, 10)
            end_date = datetime(2023, 3, 1, 10, 0).astimezone(pytz.UTC)

            await subject.execute(start_date, end_date)

        if expected:
            powerpi_mqtt_producer.assert_called_once()
        else:
            powerpi_mqtt_producer.assert_not_called()

    @pytest.fixture
    def subject_builder(
        self,
        scheduler_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_scheduler,
        powerpi_variable_manager,
        condition_parser_factory
    ) -> SubjectBuilder:
        # pylint: disable=too-many-arguments

        type(scheduler_config).timezone = PropertyMock(
            return_value='Europe/London'
        )

        def build(schedule: Dict[str, Any]):
            return DeviceSchedule(
                scheduler_config,
                powerpi_logger,
                powerpi_mqtt_client,
                powerpi_scheduler,
                powerpi_variable_manager,
                condition_parser_factory,
                schedule['device'],
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

    @pytest.fixture
    def condition_parser_factory(self, powerpi_variable_manager):
        return lambda: ConditionParser(
            powerpi_variable_manager
        )
