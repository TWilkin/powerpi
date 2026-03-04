import pytest
from powerpi_common.logger import LogMixin
from zigpy.zcl import Cluster
from zigpy.zcl.clusters.general import LevelControl as LevelControlCluster
from zigpy.zcl.clusters.general import OnOff as OnOffCluster
from zigpy.zcl.clusters.general import Scenes as ScenesCluster

from zigbee_controller.zigbee import ZigbeeController
from zigbee_controller.zigbee.mixins import (
    BindCluster,
    Button,
    ButtonMapKey,
    PressType,
    ZigbeeRemoteMixin
)


class ExampleDevice(ZigbeeRemoteMixin, LogMixin):
    BUTTON_MAP = {
        ButtonMapKey(1, OnOffCluster.cluster_id, 0x00): lambda _: (Button.DOWN, PressType.SINGLE),
        ButtonMapKey(1, OnOffCluster.cluster_id, 0x01): lambda _: (Button.UP, PressType.SINGLE),
        ButtonMapKey(1, ScenesCluster.cluster_id, 0x07): lambda args: (
            Button.LEFT if args[0][0] == 0x01 else Button.RIGHT,
            PressType.SINGLE
        ),
        ButtonMapKey(2, LevelControlCluster.cluster_id, 0x05): lambda _: (
            Button.MIDDLE, PressType.HOLD
        ),
    }

    def __init__(self, device, controller: ZigbeeController, logger):
        self.__device = device
        self.__controller = controller
        self._logger = logger

        self.broadcast_calls = []

    @property
    def _zigbee_device(self):
        return self.__device

    @property
    def _zigbee_controller(self):
        return self.__controller

    def _broadcast(self, event: str, message: dict):
        self.broadcast_calls.append((event, message))


class TestZigbeeRemoteMixin:
    def test_init_subclass_missing_button_map(self):
        with pytest.raises(TypeError, match='must define BUTTON_MAP'):
            # pylint: disable=unused-variable
            class BadDevice(ZigbeeRemoteMixin, LogMixin):
                pass

    def test_bind_clusters_derived_from_button_map(self):
        bind_clusters = set(ExampleDevice.BIND_CLUSTERS)

        assert bind_clusters == {
            BindCluster(1, OnOffCluster.cluster_id),
            BindCluster(1, ScenesCluster.cluster_id),
            BindCluster(2, LevelControlCluster.cluster_id),
        }

    @pytest.mark.asyncio
    @pytest.mark.parametrize('command_id,args,expected_button,expected_type', [
        (0x00, [], Button.DOWN, PressType.SINGLE),
        (0x01, [], Button.UP, PressType.SINGLE),
        (0x07, [[0x01]], Button.LEFT, PressType.SINGLE),
        (0x07, [[0x02]], Button.RIGHT, PressType.SINGLE),
        (0x05, [], Button.MIDDLE, PressType.HOLD),
    ])
    async def test_button_press(
        self,
        subject: ExampleDevice,
        zigbee_out_cluster: Cluster,
        command_id: int,
        args: tuple,
        expected_button: Button,
        expected_type: PressType
    ):
        await subject.initialise()

        # send the command to all registered listeners as the order is not guaranteed
        for call in zigbee_out_cluster.add_listener.call_args_list:
            call.args[0].cluster_command(0, command_id, *args)

            topic = 'press'
            message = {
                'button': expected_button,
                'type': expected_type
            }

        assert subject.broadcast_calls == [(topic, message)]

    @pytest.mark.asyncio
    async def test_unknown_command_ignored(
        self,
        subject: ExampleDevice,
        zigbee_out_cluster: Cluster
    ):
        await subject.initialise()

        for call in zigbee_out_cluster.add_listener.call_args_list:
            call.args[0].cluster_command(0, 0xFF, ())

        assert subject.broadcast_calls == []

    @pytest.fixture
    def subject(
        self,
        zigbee_device,
        zigbee_controller: ZigbeeController,
        powerpi_logger
    ):
        return ExampleDevice(zigbee_device, zigbee_controller, powerpi_logger)
