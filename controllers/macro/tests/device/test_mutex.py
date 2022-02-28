import pytest

from asyncio import Future
from pytest_mock import MockerFixture
from unittest.mock import PropertyMock

from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from macro_controller.device import MutexDevice


class TestMutexDevice(DeviceTestBase, PollableMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()

        self.devices = [mocker.Mock() for _ in range(4)]

        future = Future()
        future.set_result(None)
        for method in ['turn_on', 'turn_off']:
            for device in self.devices:
                mocker.patch.object(
                    device,
                    method,
                    return_value=future
                )

        def get_device(name: str):
            i = int(name)
            return self.devices[i]

        self.device_manager.get_device = get_device

        return MutexDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            off_devices=[0, 1],
            on_devices=[2, 3],
            name='mutex'
        )

    async def test_all_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_on()

        self.devices[0].turn_off.assert_called_once()
        self.devices[1].turn_off.assert_called_once()

        self.devices[2].turn_on.assert_called_once()
        self.devices[3].turn_on.assert_called_once()

    async def test_all_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        await subject.turn_off()

        self.devices[0].turn_off.assert_called_once()
        self.devices[1].turn_off.assert_called_once()

        self.devices[2].turn_off.assert_called_once()
        self.devices[3].turn_off.assert_called_once()

    @pytest.mark.parametrize('test_state', [('on'), ('off'), ('unknown')])
    async def test_poll(self, mocker: MockerFixture, test_state: str):
        subject = self.create_subject(mocker)

        for device in self.devices[:2]:
            type(device).state = PropertyMock(return_value='off')
        for device in self.devices[2:]:
            type(device).state = PropertyMock(return_value=test_state)

        assert subject.state == 'unknown'
        await subject.poll()
        assert subject.state == test_state
