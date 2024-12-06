from asyncio import Future
from typing import List
from unittest.mock import AsyncMock, MagicMock

import pytest
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import (InitialisableMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture
from zigpy.exceptions import DeliveryError
from zigpy.zcl import Cluster
from zigpy.zcl.foundation import Status

from zigbee_controller.device.zigbee_socket import ZigbeeSocket


class TestZigbeeDevice(
    DeviceTestBase,
    InitialisableMixinTestBase,
    PollableMixinTestBase
):
    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', [True, False])
    async def test_poll_gets_status(
        self,
        subject: ZigbeeSocket,
        cluster: Cluster,
        powerpi_mqtt_producer: MagicMock,
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

        assert subject.state == 'unknown'

        await subject.poll()

        assert subject.state == 'on' if state else 'off'

        topic = 'device/Socket/status'
        message = {'state': 'on' if state else 'off'}
        powerpi_mqtt_producer.assert_called_with(topic, message)

        # polling again doesn't produce anything as nothing changed
        powerpi_mqtt_producer.reset_mock()

        await subject.poll()

        assert subject.state == 'on' if state else 'off'

        powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    async def test_poll_fails(
        self,
        subject: ZigbeeSocket,
        cluster: Cluster,
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture
    ):
        async def read_attributes(_):
            raise DeliveryError('Boom')

        mocker.patch.object(
            cluster,
            'read_attributes',
            read_attributes
        )

        assert subject.state == 'unknown'

        await subject.poll()

        assert subject.state == 'unknown'

        powerpi_mqtt_producer.assert_not_called()

    @pytest.fixture
    def subject(self, powerpi_config, powerpi_logger, powerpi_mqtt_client, zigbee_controller):
        return ZigbeeSocket(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, zigbee_controller,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA',
            name='Socket'
        )

    @pytest.fixture(autouse=True)
    def cluster(self, zigbee_in_cluster: Cluster, mocker: MockerFixture):
        future = Future()
        future.set_result({'status': Status.SUCCESS})
        zigbee_in_cluster.command.return_value = future

        async def read_attributes(attributes: List[str]):
            return (dict(zip(attributes, [0 for _ in attributes])), None)

        mocker.patch.object(
            zigbee_in_cluster,
            'read_attributes',
            read_attributes
        )

        mocker.patch.object(
            zigbee_in_cluster,
            'write_attributes',
            AsyncMock()
        )

        return zigbee_in_cluster
