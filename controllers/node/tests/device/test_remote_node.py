from typing import Tuple
from unittest.mock import PropertyMock

import pytest
from node_controller.devices.remote_node import RemoteNodeDevice
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
            'node_controller.devices.remote_node.async_ping',
            return_value=host
        )

        await subject.poll()

        assert subject.state == state
