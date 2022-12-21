from datetime import datetime
from typing import Tuple
from unittest.mock import PropertyMock

import pytest
from node_controller.device.remote_node import RemoteNodeDevice
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from pytest_mock import MockerFixture


class TestRemoteNodeDevice(DeviceTestBase, PollableMixinTestBase):
    def get_subject(self, _: MockerFixture):
        self.ip = '127.0.0.1'

        return RemoteNodeDevice(
            self.config,
            self.logger,
            self.mqtt_client,
            self.ip,
            name='remote',
            poll_frequency=60
        )

    @pytest.mark.parametrize('states', [
        (False, DeviceStatus.OFF),
        (True, DeviceStatus.ON)
    ])
    async def test_poll_ping(self, mocker: MockerFixture, states: Tuple[bool, str]):
        is_alive, state = states

        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN

        host = mocker.Mock()
        type(host).is_alive = PropertyMock(return_value=is_alive)

        mocker.patch(
            'node_controller.device.remote_node.async_ping',
            return_value=host
        )

        await subject.poll()

        assert subject.state == state

    @pytest.mark.asyncio
    async def test_turn_on(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_on()

        assert subject.state == DeviceStatus.UNKNOWN

    @pytest.mark.asyncio
    async def test_turn_off(self, mocker: MockerFixture):
        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_off()

        assert subject.state == DeviceStatus.UNKNOWN

    @pytest.mark.asyncio
    @pytest.mark.parametrize('times', [1, 2])
    async def test_change_message(self, mocker: MockerFixture, times: int):
        subject = self.create_subject(mocker)

        assert subject.state == DeviceStatus.UNKNOWN

        mocker.patch.object(self.config, 'message_age_cutoff', 120)

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        for _ in range(1, times):
            await subject.on_message(message, subject.name, 'change')

            assert subject.state == DeviceStatus.UNKNOWN
