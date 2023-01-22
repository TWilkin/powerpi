from asyncio import Future
from typing import List

import pytest
from powerpi_common_test.device import AdditionalStateDeviceTestBaseNew
from powerpi_common_test.device.mixin import (InitialisableMixinTestBaseNew,
                                              PollableMixingTestBaseNew)
from pytest_mock import MockerFixture
from zigbee_controller.device.zigbee_light import ZigbeeLight
from zigpy.zcl import Cluster
from zigpy.zcl.foundation import Status


class TestZigbeeeLight(AdditionalStateDeviceTestBaseNew, InitialisableMixinTestBaseNew, PollableMixingTestBaseNew):
    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        zigbee_controller
    ):
        return ZigbeeLight(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, zigbee_controller,
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA',
            name='Light'
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

        async def write_attributes(_):
            pass

        mocker.patch.object(
            zigbee_in_cluster,
            'write_attributes',
            write_attributes
        )

        return zigbee_in_cluster
