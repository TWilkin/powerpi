from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from powerpi_common_test.sensor import SensorTestBase
from pytest_mock import MockerFixture
from zigpy.endpoint import Endpoint
from zigpy.zcl.clusters.general import (
    LevelControl as LevelControlCluster,
    OnOff as OnOffCluster,
    Scenes as ScenesCluster
)
from zigpy.types import EUI64
from zigpy.zdo.types import LogicalType

from zigbee_controller.sensor.ikea.stybar import IKEAStyrbarSensor


test_ieee = '00:00:00:00:00:00:00:00'


class TestIKEAStyrbarSensor(SensorTestBase, InitialisableMixinTestBase):
    @pytest.mark.asyncio
    @pytest.mark.parametrize('cluster_id,command_id,args,expected_button,expected_type', [
        (OnOffCluster.cluster_id, 0x00, [], 'down', 'single'),
        (OnOffCluster.cluster_id, 0x01, [], 'up', 'single'),
        (ScenesCluster.cluster_id, 0x07, [[0x01]], 'left', 'single'),
        (ScenesCluster.cluster_id, 0x07, [[0x02]], 'right', 'single'),
        (LevelControlCluster.cluster_id, 0x01, [], 'down', 'hold'),
        (LevelControlCluster.cluster_id, 0x03, [], 'down', 'release'),
        (LevelControlCluster.cluster_id, 0x05, [], 'up', 'hold'),
        (LevelControlCluster.cluster_id, 0x07, [], 'up', 'release'),
    ])
    async def test_button_press(
        self,
        subject: IKEAStyrbarSensor,
        powerpi_mqtt_producer: MagicMock,
        out_clusters: dict[int, MagicMock],
        cluster_id: int,
        command_id: int,
        args: list,
        expected_button: str,
        expected_type: str
    ):
        await subject.initialise()

        cluster = out_clusters[cluster_id]
        listener = cluster.add_listener.call_args[0][0]
        listener.cluster_command(0, command_id, *args)

        topic = 'event/test/press'

        message = {
            'button': expected_button,
            'type': expected_type
        }

        powerpi_mqtt_producer.assert_called_once()
        powerpi_mqtt_producer.assert_called_once_with(topic, message)

    @pytest.mark.asyncio
    async def test_device_joined_configures_device(
        self,
        subject: IKEAStyrbarSensor,
        zigbee_controller: MagicMock,
        zigbee_device: MagicMock
    ):
        zigbee_device.ieee = EUI64.convert(test_ieee)

        await subject.initialise()

        join_listener = zigbee_controller.add_listener.call_args_list[0].args[0]
        join_listener.device_joined(zigbee_device)

        zigbee_device.add_endpoint.assert_called_once_with(1)
        assert zigbee_device.node_desc.logical_type == LogicalType.EndDevice
        assert zigbee_device.model == 'Remote Control N2'
        assert zigbee_device.manufacturer == 'IKEA of Sweden'

    @pytest.fixture
    def out_clusters(self, mocker: MockerFixture, zigbee_endpoint: Endpoint):
        clusters = {}
        for cluster_id in [
            OnOffCluster.cluster_id,
            ScenesCluster.cluster_id,
            LevelControlCluster.cluster_id
        ]:
            clusters[cluster_id] = mocker.MagicMock()

        out_clusters_mock = mocker.MagicMock()
        out_clusters_mock.__getitem__.side_effect = lambda cid: clusters[cid]

        type(zigbee_endpoint).out_clusters = PropertyMock(
            return_value=out_clusters_mock
        )

        return clusters

    @pytest.fixture
    def subject(self, powerpi_logger, zigbee_controller, powerpi_mqtt_client):
        return IKEAStyrbarSensor(
            powerpi_logger, zigbee_controller, powerpi_mqtt_client,
            ieee=test_ieee, nwk='0xAAAA', name='test'
        )
