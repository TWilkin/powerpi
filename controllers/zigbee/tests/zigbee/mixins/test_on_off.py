from asyncio import Future

import pytest
from powerpi_common.device import DeviceStatus
from pytest_mock import MockerFixture
from zigpy.exceptions import DeliveryError
from zigpy.zcl import Cluster
from zigpy.zcl.foundation import Status

from zigbee_controller.zigbee.mixins.on_off import ZigbeeOnOffMixin


class TestDevice(ZigbeeOnOffMixin):
    async def read_status(self, device):
        return await self._read_status(device)


class TestZigbeeOnOffMixin:
    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [True, False])
    async def test_poll_gets_status(
        self,
        subject: TestDevice,
        cluster: Cluster,
        zigbee_device,
        mocker: MockerFixture,
        state: bool,
    ):
        # pylint: disable=too-many-arguments

        async def read_attributes(_):
            return ({'on_off': state}, None)

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        result = await subject.read_status(zigbee_device)

        expected = DeviceStatus.ON if state else DeviceStatus.OFF
        assert result == expected

    @pytest.mark.asyncio
    async def test_poll_fails(
        self,
        subject: TestDevice,
        cluster: Cluster,
        zigbee_device,
        mocker: MockerFixture
    ):
        async def read_attributes(_):
            raise DeliveryError('Boom')

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        result = await subject.read_status(zigbee_device)

        assert result == DeviceStatus.UNKNOWN

    @pytest.fixture
    def subject(self):
        return TestDevice()

    @pytest.fixture(autouse=True)
    def cluster(self, zigbee_in_cluster: Cluster):
        future = Future()
        future.set_result({'status': Status.SUCCESS})
        zigbee_in_cluster.command.return_value = future

        return zigbee_in_cluster
