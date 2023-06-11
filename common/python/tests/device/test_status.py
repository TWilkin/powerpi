from types import MethodType
from typing import Union
from unittest.mock import PropertyMock

import pytest
from apscheduler.triggers.interval import IntervalTrigger
from pytest_mock import MockerFixture

from powerpi_common.config import Config
from powerpi_common.device.mixin.pollable import PollableMixin
from powerpi_common.device.status import DeviceStatusChecker


class PollableDeviceImpl(PollableMixin):
    def __init__(self, config: Config, name: str, poll_frequency: Union[int, None]):
        PollableMixin.__init__(self, config, poll_frequency)
        self.name = name
        self.count = 0

    async def poll(self):
        self.count += 1


class TestDeviceStatusChecker:

    @pytest.mark.parametrize('normal', [0, 3])
    @pytest.mark.parametrize('pollable_none', [0, 2])
    @pytest.mark.parametrize('pollable_60', [0, 4])
    @pytest.mark.parametrize('pollable_3', [0, 6])
    @pytest.mark.parametrize('disabled', [0, 5])
    def test_start(
        self,
        subject: DeviceStatusChecker,
        powerpi_config,
        powerpi_scheduler,
        device_builder,
        normal: int,
        pollable_none: int,
        pollable_60: int,
        pollable_3: int,
        disabled: int
    ):
        # pylint: disable=too-many-arguments

        powerpi_config.poll_frequency = 120

        groups = []
        timers = []

        def add_job(method: MethodType, trigger: IntervalTrigger):
            groups.append(method.__self__)
            timers.append(trigger.interval.seconds)

        powerpi_scheduler.add_job = add_job

        device_builder(
            normal, pollable_none, pollable_60, pollable_3, disabled
        )

        subject.start()

        if pollable_none + pollable_60 + pollable_3 != 0:
            count = sum(
                1 if x > 0 else 0
                for x in [pollable_none, pollable_60, pollable_3]
            )

            assert len(timers) == count
            assert len(groups) == count

        for count, interval in zip([pollable_none, pollable_60, pollable_3], [120, 60, 10]):
            if count > 0:
                assert interval in timers
                assert any((
                    group.poll_frequency == interval
                    and len(group.devices) == count
                    for group in groups
                ))

    async def test_run(self, subject: DeviceStatusChecker, powerpi_scheduler, device_builder):
        groups = []

        def add_job(method: MethodType, **_):
            groups.append(method.__self__)

        powerpi_scheduler.add_job = add_job

        (pollable_devices, normal_devices, disabled_devices) \
            = device_builder(1, 3, 4, 2, 2)

        subject.start()

        async def check(count: int):
            for group in groups:
                await group.run()

            for device in pollable_devices:
                assert device.count == count

            for device in normal_devices:
                device.poll.assert_not_called()

            for device in disabled_devices:
                assert device.count == 0

        await check(1)
        await check(2)
        await check(3)

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_device_manager,
        powerpi_scheduler,
        mocker: MockerFixture
    ):
        # pylint: disable=too-many-arguments
        mocker.patch.object(powerpi_config, 'poll_frequency', 1)

        return DeviceStatusChecker(
            powerpi_logger, powerpi_device_manager, powerpi_scheduler
        )

    @pytest.fixture
    def device_builder(
        self,
        powerpi_config,
        powerpi_device_manager,
        mocker: MockerFixture
    ):
        # pylint: disable=too-many-arguments

        def add(
            normal: int,
            pollable_none: int,
            pollable_60: int,
            pollable_3: int,
            disabled: int
        ):
            normal_devices = []

            for i in range(0, normal):
                device = mocker.Mock()
                type(device).name = PropertyMock(return_value=f'device_{i}')
                normal_devices.append(device)

            pollable_none_devices = [
                PollableDeviceImpl(powerpi_config, f'pollable_none_{i}', None)
                for i in range(0, pollable_none)
            ]

            pollable_60_devices = [
                PollableDeviceImpl(powerpi_config, f'pollable_60_{i}', 60)
                for i in range(0, pollable_60)
            ]

            pollable_3_devices = [
                PollableDeviceImpl(powerpi_config, f'pollable_3_{i}', 3)
                for i in range(0, pollable_3)
            ]

            disabled_pollable_devices = [
                PollableDeviceImpl(powerpi_config, f'disabled_{i}', 0)
                for i in range(0, disabled)
            ]

            all_devices = []
            all_devices.extend(normal_devices)
            all_devices.extend(pollable_none_devices)
            all_devices.extend(pollable_60_devices)
            all_devices.extend(pollable_3_devices)
            all_devices.extend(disabled_pollable_devices)

            powerpi_device_manager.devices_and_sensors = all_devices

            return (
                pollable_none_devices + pollable_60_devices + pollable_3_devices,
                normal_devices,
                disabled_pollable_devices
            )

        return add
