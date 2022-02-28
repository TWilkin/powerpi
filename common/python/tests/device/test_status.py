import pytest

from pytest_mock import MockerFixture
from unittest.mock import PropertyMock

from powerpi_common.device.mixin.pollable import PollableMixin
from powerpi_common.device.status import DeviceStatusChecker


class PollableDeviceImpl(PollableMixin):
    def __init__(self, name: str):
        self.name = name
        self.count = 0
    
    def _poll(self):
        self.count += 1


class TestDeviceStatusChecker(object):
    pytestmark = pytest.mark.asyncio

    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.scheduler = mocker.Mock()

        mocker.patch.object(self.config, 'poll_frequency', 1)

        return DeviceStatusChecker(
            self.config, self.logger, self.device_manager, self.scheduler
        )
    
    @pytest.mark.parametrize('normal_devices', [0, 5])
    @pytest.mark.parametrize('pollable_devices', [0, 3])
    def test_devices(self, mocker: MockerFixture, normal_devices: int, pollable_devices: int):
        subject = self.get_subject(mocker)

        self.__add_devices(mocker, normal_devices, pollable_devices)

        devices = subject.devices
        assert len(devices) == pollable_devices

    @pytest.mark.parametrize('devices', [True, False])
    def test_start(self, mocker: MockerFixture, devices: bool):
        subject = self.get_subject(mocker)

        self.__add_devices(mocker, 1, 1 if devices else 0)

        subject.start()

        if devices:
            self.scheduler.add_job.assert_called()
            self.scheduler.start.assert_called()
        else:
            self.scheduler.add_job.assert_not_called()
            self.scheduler.start.assert_not_called()
    
    @pytest.mark.parametrize('running', [True, False])
    def test_stop(self, mocker: MockerFixture, running: bool):
        subject = self.get_subject(mocker)

        type(self.scheduler).running = PropertyMock(return_value=running)

        subject.stop()

        if running:
            self.scheduler.shutdown.assert_called()
        else:
            self.scheduler.shutdown.assert_not_called()
    
    async def test_run(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        pollable_devices = self.__add_devices(mocker, 1, 3)

        await subject._run()

        for device in pollable_devices:
            assert device.count == 1

        await subject._run()

        for device in pollable_devices:
            assert device.count == 2

    def __add_devices(self, mocker: MockerFixture, normal: int, pollable: int):
        normal_devices = []
        for i in range(0, normal):
            device = mocker.Mock()
            type(device).name = PropertyMock(return_value=f'device{i}')
            normal_devices.append(device)

        pollable_devices = [PollableDeviceImpl(f'pollable{i}') for i in range(0, pollable)]

        all_devices = []
        all_devices.extend(normal_devices)
        all_devices.extend(pollable_devices)

        self.device_manager.devices = {
            device.name: device for device in all_devices
        }

        return pollable_devices
