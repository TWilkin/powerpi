from datetime import datetime
from unittest.mock import PropertyMock

import pytest
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import PollableMixinTestBase
from pytest_mock import MockerFixture

from node_controller.device.remote_node import RemoteNodeDevice


class TestRemoteNodeDevice(DeviceTestBase, PollableMixinTestBase):
    @pytest.mark.asyncio
    async def test_poll_implemented(self, subject: RemoteNodeDevice, mocker: MockerFixture):
        # pylint: disable=arguments-differ

        host = mocker.MagicMock()
        type(host).is_alive = PropertyMock(return_value=True)

        mocker.patch(
            'node_controller.device.remote_node.async_ping',
            return_value=host
        )

        await subject.poll()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('is_alive,state', [
        (False, DeviceStatus.OFF),
        (True, DeviceStatus.ON)
    ])
    async def test_poll_ping(
        self,
        subject: RemoteNodeDevice,
        mocker: MockerFixture,
        is_alive: bool,
        state: DeviceStatus
    ):
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
    async def test_turn_on(self, subject: RemoteNodeDevice):
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_on()

        assert subject.state == DeviceStatus.UNKNOWN

    @pytest.mark.asyncio
    async def test_turn_off(self, subject: RemoteNodeDevice):
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_off()

        assert subject.state == DeviceStatus.UNKNOWN

    @pytest.mark.asyncio
    @pytest.mark.parametrize('times', [1, 2])
    async def test_change_message(
        self,
        subject: RemoteNodeDevice,
        times: int
    ):
        # pylint: disable=arguments-differ

        assert subject.state == DeviceStatus.UNKNOWN

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        for _ in range(1, times):
            await subject.on_message(message, subject.name, 'change')

            assert subject.state == DeviceStatus.UNKNOWN
            assert subject.state == DeviceStatus.UNKNOWN
            assert subject.state == DeviceStatus.UNKNOWN

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client
    ):
        return RemoteNodeDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            '127.0.0.1',
            name='remote',
            poll_frequency=60
        )
