

from collections import namedtuple
from datetime import datetime
from types import MethodType
from typing import Any, Callable, Dict, List, Tuple, Union
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
import pytz
from apscheduler.triggers.interval import IntervalTrigger
from pytest_mock import MockerFixture
from scheduler.services import DeviceSchedule

ExpectedTime = namedtuple('ExpectedTime', 'day hour minute')


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
        add_job,
        data: Tuple[str, str, Union[List[int], None], ExpectedTime, ExpectedTime],
        interval: int
    ):
        (start_time, end_time, days, expected_start, expected_end) = data

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

    @pytest.mark.asyncio
    @pytest.mark.parametrize('data', [
        ({}, None),
        ({'power': True}, {'state': 'on'}),
        ({'brightness': [0, 50]}, {'brightness': 31}),
        ({'temperature': [1000, 2000]}, {'temperature': 1620}),
        ({'hue': [0, 360]}, {'hue': 223}),
        ({'saturation': [0, 255]}, {'saturation': 158}),
        (
            {
                'power': False,
                'brightness': [0, 100],
                'temperature': [2000, 4000]
            },
            {
                'brightness': 62,
                'temperature': 3240,
                'state': 'off'
            }
        )
    ])
    async def test_execute(
        self,
        subject_builder: Callable[[Dict[str, Any]], DeviceSchedule],
        add_job,
        powerpi_mqtt_producer: MagicMock,
        data: Tuple[dict, dict]
    ):
        (config, expected) = data

        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, 9, 31
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

    @pytest.mark.asyncio
    @pytest.mark.parametrize('data', [
        ([0, 100], 8, 55, 0),
        ([100, 0], 8, 55, 100),
        ([0, 100], 10, 1, 100),
        ([100, 0], 10, 1, 0)
    ])
    async def test_execute_round(
        self,
        subject_builder: Callable[[Dict[str, Any]], DeviceSchedule],
        powerpi_mqtt_producer: MagicMock,
        data: Tuple[List[int], int, int, int]
    ):
        (brightness, hour, minute, expected) = data

        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, hour, minute
            ).astimezone(pytz.UTC)

            subject = subject_builder({
                'device': 'SomeDevice',
                'between': ['09:10:00', '10:00:00'],
                'interval': 60,
                'brightness': brightness
            })

            start_date = datetime(2023, 3, 1, 9, 10)
            end_date = datetime(2023, 3, 1, 10, 0).astimezone(pytz.UTC)

            await subject.execute(start_date, end_date)

        message = {
            'brightness': expected
        }

        topic = 'device/SomeDevice/change'
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.mark.asyncio
    async def test_execute_schedule_next(
        self,
        subject_builder: Callable[[Dict[str, Any]], DeviceSchedule],
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
    @pytest.mark.parametrize('data', [
        ([0, 100], 50, 50 + 21),
        ([100, 0], 50, 50 - 21),
        ([0, 100], 0, 21 * 2),
        ([100, 0], 100, 100 - 21 * 2),
        ([0, 100], 100, 100),
        ([100, 0], 0, 0)
    ])
    async def test_execute_current_value(
        self,
        subject_builder: Callable[[Dict[str, Any]], DeviceSchedule],
        powerpi_mqtt_producer: MagicMock,
        powerpi_variable_manager: MagicMock,
        mocker: MockerFixture,
        data: Tuple[List[int], int, int]
    ):
        # pylint: disable=too-many-arguments,too-many-locals
        (brightness, current, expected) = data

        variable = mocker.MagicMock()
        powerpi_variable_manager.get_device = lambda _: variable

        type(variable).additional_state = PropertyMock(
            return_value={'brightness': current}
        )

        with patch('scheduler.services.device_schedule.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(
                2023, 3, 1, 9, 31
            ).astimezone(pytz.UTC)

            subject = subject_builder({
                'device': 'SomeDevice',
                'between': ['09:10:00', '10:00:00'],
                'interval': 60,
                'brightness': brightness
            })

            start_date = datetime(2023, 3, 1, 9, 10)
            end_date = datetime(2023, 3, 1, 10, 0).astimezone(pytz.UTC)

            await subject.execute(start_date, end_date)

        topic = 'device/SomeDevice/change'
        message = {'brightness': expected}
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.mark.asyncio
    @pytest.mark.parametrize('data', [
        (True, 'on', True),
        (True, 'off', False),
        (False, 'off', True)
    ])
    async def test_execute_condition(
        self,
        subject_builder: Callable[[Dict[str, Any]], DeviceSchedule],
        powerpi_mqtt_producer: MagicMock,
        powerpi_variable_manager: MagicMock,
        mocker: MockerFixture,
        data: Tuple[bool, str, bool]
    ):
        # pylint: disable=too-many-arguments
        (set_condition, current_state, expected) = data

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
        powerpi_variable_manager
    ):
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
