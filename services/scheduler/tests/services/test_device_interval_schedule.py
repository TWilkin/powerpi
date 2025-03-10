from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime
from types import MethodType
from typing import Any, Callable, Dict, List, Tuple
from unittest.mock import MagicMock, PropertyMock, patch

import pytest
import pytz
from apscheduler.triggers.interval import IntervalTrigger
from cron_converter import Cron
from powerpi_common.condition import ConditionParser, Expression
from powerpi_common.device import ReservedScenes
from pytest_mock import MockerFixture

from scheduler.services import DeviceIntervalSchedule

SubjectBuilder = Callable[[Dict[str, Any]], DeviceIntervalSchedule]

AddJobType = List[Tuple[
    MethodType,
    IntervalTrigger,
    Dict[str, datetime]
]]


@dataclass
class ExpectedTime:
    day: int
    hour: int
    minute: int


class TestDeviceIntervalSchedule:
    __expected_topic = 'device/SomeDevice/change'

    @pytest.mark.parametrize('schedule,duration,now,expected_start,expected_end', [
        (
            '0 9 * * *', 30 * 60, None,
            ExpectedTime(2, 9, 0), ExpectedTime(2, 9, 30)
        ),
        (
            '30 18 * * *', 1.5 * 60 * 60, None,
            ExpectedTime(1, 18, 30), ExpectedTime(1, 20, 0)
        ),
        (
            '45 21 * * *', 2.25 * 60 * 60, None,
            ExpectedTime(1, 21, 45), ExpectedTime(2, 0, 0)
        ),
        (
            '45 1 * * *', 24 * 60 * 60 - 1, None,
            ExpectedTime(1, 1, 45), ExpectedTime(2, 1, 44)
        ),
        (
            '0 9 * * 2', 30 * 60, None,
            ExpectedTime(7, 9, 0), ExpectedTime(7, 9, 30)
        ),
        (
            '0 17 * * 3', 2 * 60 * 60, None,
            ExpectedTime(1, 17, 0), ExpectedTime(1, 19, 0)
        ),
        # day light savings
        # before change over (summer time)
        (
            '0 9 * * *', 30 * 60, datetime(2023, 10, 27, 9, 30, 1),
            ExpectedTime(28, 8, 0), ExpectedTime(28, 8, 30)
        ),
        # after change over (summer -> winter time)
        (
            '0 9 * * *', 30 * 60, datetime(2023, 10, 28, 9, 30, 1),
            ExpectedTime(29, 9, 0), ExpectedTime(29, 9, 30)
        ),
        # other way
        # before change over (winter time)
        (
            '0 9 * * *', 30 * 60, datetime(2024, 3, 29, 9, 30, 1),
            ExpectedTime(30, 9, 0), ExpectedTime(30, 9, 30)
        ),
        # after change over (winter -> summer time)
        (
            '0 9 * * *', 30 * 60, datetime(2024, 3, 30, 9, 30, 1),
            ExpectedTime(31, 8, 0), ExpectedTime(31, 8, 30)
        ),
    ])
    @pytest.mark.parametrize('interval', [1, 60])
    def test_start(
        self,
        subject_builder: SubjectBuilder,
        add_job: AddJobType,
        schedule: str,
        duration: int,
        now: datetime | None,
        expected_start: ExpectedTime,
        expected_end: ExpectedTime,
        interval: int
    ):
        # pylint: disable=too-many-arguments

        subject = subject_builder({
            'device': 'SomeDevice',
            'schedule': schedule,
            'duration': duration,
            'interval': interval
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

        assert job[1].start_date.day == expected_start.day
        assert job[1].start_date.hour == expected_start.hour
        assert job[1].start_date.minute == expected_start.minute
        assert job[1].start_date.tzinfo == pytz.UTC

        assert job[1].end_date.day == expected_end.day
        assert job[1].end_date.hour == expected_end.hour
        assert job[1].end_date.minute == expected_end.minute
        assert job[1].end_date.tzinfo == pytz.UTC

        assert job[1].interval.seconds == interval

        assert job[2]['start_date'] == job[1].start_date
        assert job[2]['end_date'] == job[1].end_date

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
            'schedule': '0 9 * * *',
            'duration': 60 * 60,
            'interval': 60,
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
        add_job: AddJobType,
        powerpi_mqtt_producer: MagicMock,
        config: Dict[str, Any],
        expected: Dict[str, Any]
    ):
        # pylint: disable=too-many-arguments

        with patch_datetime(datetime(2023, 3, 1, 9, 1, tzinfo=pytz.UTC)):
            subject = subject_builder({
                'device': 'SomeDevice',
                'schedule': '0 9 * * *',
                'duration': 50 * 60,
                'interval': 60,
                **config
            })

            start_date = datetime(2023, 3, 1, 9, 00, tzinfo=pytz.UTC)
            end_date = datetime(2023, 3, 1, 9, 50, tzinfo=pytz.UTC)

            await subject.execute(start_date=start_date, end_date=end_date)

        # it's not the last run
        assert len(add_job) == 0

        if expected is not None:
            powerpi_mqtt_producer.assert_called_once_with(
                self.__expected_topic, expected
            )
        else:
            powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('brightness,current,expected', [
        ([0, 100], 1.111, 1.11 + 1.94),
        ([100, 0], 100 - 1.111, 100 - 1.11 - 1.94)
    ])
    async def test_execute_round2dp(
        self,
        subject_builder: SubjectBuilder,
        powerpi_variable_manager,
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture,
        brightness: List[int],
        current: int,
        expected: int
    ):
        # pylint: disable=too-many-arguments

        variable = mocker.MagicMock()
        powerpi_variable_manager.get_device = lambda _: variable

        variable.get_additional_state_for_scene = lambda _: {
            'brightness': current
        }

        with patch_datetime(datetime(2023, 3, 1, 9, 1, tzinfo=pytz.UTC)):
            subject = subject_builder({
                'device': 'SomeDevice',
                'schedule': '10 9 * * *',
                'duration': 50 * 60,
                'interval': 60,
                'brightness': brightness
            })

            start_date = datetime(2023, 3, 1, 9, 10)
            end_date = datetime(2023, 3, 1, 10, 0, tzinfo=pytz.UTC)

            await subject.execute(start_date=start_date, end_date=end_date)

        message = {
            'brightness': expected
        }

        powerpi_mqtt_producer.assert_called_once_with(
            self.__expected_topic, message
        )

    @pytest.mark.asyncio
    @pytest.mark.parametrize('hue,current,expected', [
        ([0, 360], 1.111, 2 + 6),
        ([360, 0], 360 - 1.111, 360 - 2 - 6)
    ])
    async def test_execute_round0dp(
        self,
        subject_builder: SubjectBuilder,
        powerpi_variable_manager,
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture,
        hue: List[int],
        current: int,
        expected: int
    ):
        # pylint: disable=too-many-arguments

        variable = mocker.MagicMock()
        powerpi_variable_manager.get_device = lambda _: variable

        variable.get_additional_state_for_scene = lambda _: {
            'hue': current
        }

        with patch_datetime(datetime(2023, 3, 1, 9, 1, tzinfo=pytz.UTC)):
            subject = subject_builder({
                'device': 'SomeDevice',
                'schedule': '10 9 * * *',
                'duration': 50 * 60,
                'interval': 60,
                'hue': hue
            })

            start_date = datetime(2023, 3, 1, 9, 10)
            end_date = datetime(2023, 3, 1, 10, 0, tzinfo=pytz.UTC)

            await subject.execute(start_date=start_date, end_date=end_date)

        message = {
            'hue': expected
        }

        powerpi_mqtt_producer.assert_called_once_with(
            self.__expected_topic, message
        )

    @pytest.mark.asyncio
    async def test_execute_schedule_next(
        self,
        subject_builder: SubjectBuilder,
        add_job: AddJobType,
    ):
        with patch_datetime(datetime(2023, 3, 1, 9, 30, 1, tzinfo=pytz.UTC)):
            subject = subject_builder({
                'device': 'SomeDevice',
                'schedule': '0 9 * * *',
                'duration': 30 * 60,
                'interval': 60
            })

            start_date = datetime(2023, 3, 1, 9, 00)
            end_date = datetime(2023, 3, 1, 9, 30, tzinfo=pytz.UTC)

            await subject.execute(start_date=start_date, end_date=end_date)

        assert len(add_job) == 1

        job = add_job[0]

        assert job is not None
        assert job[0].__name__ == 'execute'

        assert job[1].start_date.day == 2
        assert job[1].start_date.hour == 9
        assert job[1].start_date.minute == 0
        assert job[1].start_date.tzinfo == pytz.UTC

        assert job[1].end_date.day == 2
        assert job[1].end_date.hour == 9
        assert job[1].end_date.minute == 30
        assert job[1].start_date.tzinfo == pytz.UTC

        assert job[1].interval.seconds == 60

        assert job[2]['start_date'] == job[1].start_date
        assert job[2]['end_date'] == job[1].end_date

    @pytest.mark.asyncio
    @pytest.mark.parametrize('brightness,current,expected,force', [
        ([0, 100], 50, [60, 70, 80, 90, 100], False),
        ([100, 0], 50, [40, 30, 20, 10, 0], False),
        ([0, 100], 0, [20, 40, 60, 80, 100], False),
        ([100, 0], 100, [80, 60, 40, 20, 0], False),
        ([0, 100], 100, [100, 100, 100, 100, 100], False),
        ([100, 0], 0, [0, 0, 0, 0, 0], False),
        ([10, 50], 25, [30, 35, 40, 45, 50], False),
        ([80, 50], 75, [70, 65, 60, 55, 50], False),
        ([20, 30], 31, [31, 31, 31, 31, 31], False),  # not increasing
        ([30, 20], 19, [19, 19, 19, 19, 19], False),  # not decreasing
        # force
        ([70, 20], 100, [60, 50, 40, 30, 20], True),
        ([0, 50], 50, [10, 20, 30, 40, 50], True),
        ([50, 0], 0, [40, 30, 20, 10, 0], True),
    ])
    async def test_execute_current_value(
        self,
        subject_builder: SubjectBuilder,
        powerpi_mqtt_producer: MagicMock,
        powerpi_variable_manager: MagicMock,
        mocker: MockerFixture,
        brightness: List[int],
        current: float,
        expected: List[float],
        force: bool
    ):
        # pylint: disable=too-many-arguments,too-many-locals

        variable = mocker.MagicMock()
        powerpi_variable_manager.get_device = lambda _: variable

        subject = subject_builder({
            'device': 'SomeDevice',
            'schedule': '11 9 * * *',
            'duration': 4 * 60,
            'interval': 60,
            'brightness': brightness,
            'force': force
        })

        async def execute(minutes: float, current: float, expected: float):
            variable.get_additional_state_for_scene = lambda _: {
                'brightness': current
            }

            start_date = datetime(2023, 3, 1, 9, 11)
            end_date = datetime(2023, 3, 1, 9, 15, tzinfo=pytz.UTC)

            with patch_datetime(datetime(2023, 3, 1, 9, minutes, tzinfo=pytz.UTC)):
                await subject.execute(start_date=start_date, end_date=end_date)

            message = {'brightness': expected}
            powerpi_mqtt_producer.assert_called_once_with(
                self.__expected_topic, message
            )

            powerpi_mqtt_producer.reset_mock()

        previous = current
        for i, expected_value in enumerate(expected):
            await execute(11 + i, previous, expected_value)

            previous = expected_value

    @pytest.mark.asyncio
    async def test_execute_current_value_scenes(
        self,
        subject_builder: SubjectBuilder,
        powerpi_mqtt_producer: MagicMock,
        powerpi_variable_manager: MagicMock,
        mocker: MockerFixture
    ):
        variable = mocker.MagicMock()
        powerpi_variable_manager.get_device = lambda _: variable

        variable.get_additional_state_for_scene = lambda scene: \
            {'brightness': 75} if scene == 'other' else {'brightness': 100}

        subject = subject_builder({
            'device': 'SomeDevice',
            'scene': 'other',
            'schedule': '0 9 * * *',
            'duration': 50 * 60,
            'interval': 60,
            'brightness': [0, 100],
        })

        async def execute(scene: str, expected: float):
            powerpi_mqtt_producer.reset_mock()

            type(variable).scene = PropertyMock(return_value=scene)

            with patch_datetime(datetime(2023, 3, 1, 9, 26, tzinfo=pytz.UTC)):
                start_date = datetime(2023, 3, 1, 9, 0, tzinfo=pytz.UTC)
                end_date = datetime(2023, 3, 1, 9, 50, tzinfo=pytz.UTC)

                await subject.execute(start_date=start_date, end_date=end_date)

            message = {'brightness': expected, 'scene': 'other'}
            powerpi_mqtt_producer.assert_called_once_with(
                self.__expected_topic, message
            )

        # when we're in the wrong scene it pulls the value from correct scene anyway
        await execute(ReservedScenes.DEFAULT, 75 + 1)

        # still works when we're in the correct scene
        await execute('other', 75 + 1)

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

        with patch_datetime(datetime(2023, 3, 1, 9, 31, tzinfo=pytz.UTC)):
            subject = subject_builder({
                'device': 'SomeDevice',
                'schedule': '10 9 * * *',
                'duration': 50 * 60,
                'interval': 60,
                'brightness': [0, 100],
                'condition': None if not set_condition
                else {'when': [{'equals': [{'var': 'device.Test.state'}, 'on']}]}
            })

            start_date = datetime(2023, 3, 1, 9, 10)
            end_date = datetime(2023, 3, 1, 10, 0, tzinfo=pytz.UTC)

            await subject.execute(start_date=start_date, end_date=end_date)

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
        condition_parser_factory,
        cron_factory
    ) -> SubjectBuilder:
        # pylint: disable=too-many-arguments

        type(scheduler_config).timezone = PropertyMock(
            return_value='Europe/London'
        )

        def build(schedule: Dict[str, Any]):
            return DeviceIntervalSchedule(
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
            trigger: IntervalTrigger,
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
        if timezone is not None:
            return mock_now.astimezone(timezone)

        return mock_now.astimezone(pytz.UTC)

    with patch('scheduler.services.device_interval_schedule.datetime') as mock_datetime:
        mock_datetime.combine = datetime.combine
        mock_datetime.now = now

        yield mock_datetime
