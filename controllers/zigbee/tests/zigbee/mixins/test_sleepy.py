from asyncio import Future, sleep
from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.logger import LogMixin
from pytest_mock import MockerFixture
from zigpy.device import Device as ZigPyDevice
from zigpy.endpoint import Endpoint, Status
from zigpy.exceptions import DeliveryError
from zigpy.types import EUI64
from zigpy.zcl import Cluster
from zigpy.zcl.clusters.general import LevelControl as LevelControlCluster
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.zigbee import ZigbeeController
from zigbee_controller.zigbee.mixins import ZigbeeSleepyMixin, BindCluster


class ExampleDevice(ZigbeeSleepyMixin, LogMixin):
    BIND_CLUSTERS = [
        BindCluster(1, OnOffCluster.cluster_id),
        BindCluster(1, LevelControlCluster.cluster_id)
    ]

    def __init__(self, device, controller: ZigbeeController, logger):
        ZigbeeSleepyMixin.__init__(self)

        self.__device = device
        self.__controller = controller
        self._logger = logger

        self.configure_device_called = False

    @property
    def ieee(self):
        return self.__device.ieee

    @property
    def _zigbee_device(self):
        return self.__device

    @property
    def _zigbee_controller(self):
        return self.__controller

    def _add_controller_listener(self, listener):
        self.__controller.add_listener(listener)

    def _configure_device(self, device: ZigPyDevice):
        self.configure_device_called = True


class TestZigbeeSleepyMixin:
    def test_init_subclass_missing_bind_clusters(self):
        with pytest.raises(TypeError, match='must define BIND_CLUSTERS'):
            # pylint: disable=unused-variable
            class BadDevice(ZigbeeSleepyMixin, LogMixin):
                pass

    @pytest.mark.asyncio
    async def test_device_joined(
        self,
        subject: ExampleDevice,
        zigbee_controller: ZigbeeController,
        zigbee_device: MagicMock,
        zigbee_endpoint: Endpoint
    ):
        await subject.initialise()

        join_listener = zigbee_controller.add_listener.call_args_list[0].args[0]
        join_listener.device_joined(zigbee_device)

        zigbee_device.cancel_initialization.assert_called_once()
        assert subject.configure_device_called
        assert zigbee_endpoint.status == Status.ZDO_INIT

        zigbee_controller.controller_application.device_initialized \
            .assert_called_once_with(zigbee_device)

    @pytest.mark.asyncio
    async def test_device_joined_wrong_device(
        self,
        subject: ExampleDevice,
        zigbee_controller: ZigbeeController,
        other_device: MagicMock
    ):
        await subject.initialise()

        join_listener = zigbee_controller.add_listener.call_args_list[0].args[0]
        join_listener.device_joined(other_device)

        other_device.cancel_initialization.assert_not_called()
        assert not subject.configure_device_called

    @pytest.mark.asyncio
    async def test_handle_message_triggers_bind(
        self,
        subject: ExampleDevice,
        zigbee_controller: ZigbeeController,
        zigbee_device: MagicMock,
        cluster: Cluster
    ):
        await subject.initialise()

        message_listener = zigbee_controller.add_listener.call_args_list[1].args[0]
        message_listener.handle_message(zigbee_device, 0, 0, 0, 0, b'')
        await self.__flush_tasks()

        assert cluster.bind.call_count == 2

        # second message should not trigger bind again
        message_listener.handle_message(zigbee_device, 0, 0, 0, 0, b'')
        await self.__flush_tasks()
        assert cluster.bind.call_count == 2

    @pytest.mark.asyncio
    async def test_handle_message_wrong_device(
        self,
        subject: ExampleDevice,
        zigbee_controller: ZigbeeController,
        cluster: Cluster,
        other_device: MagicMock
    ):
        await subject.initialise()

        message_listener = zigbee_controller.add_listener.call_args_list[1].args[0]
        message_listener.handle_message(other_device, 0, 0, 0, 0, b'')

        cluster.bind.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('exception', [DeliveryError, TimeoutError])
    async def test_bind_cluster_failure_retries(
        self,
        subject: ExampleDevice,
        zigbee_controller: ZigbeeController,
        zigbee_device: MagicMock,
        cluster: Cluster,
        exception: type
    ):
        cluster.bind = self.__make_bind(exception('Boom'))

        await subject.initialise()

        message_listener = zigbee_controller.add_listener.call_args_list[1].args[0]
        message_listener.handle_message(zigbee_device, 0, 0, 0, 0, b'')
        await self.__flush_tasks()

        # failure resets bound, so a second message should trigger bind again
        cluster.bind = self.__make_bind()

        message_listener.handle_message(zigbee_device, 0, 0, 0, 0, b'')
        await self.__flush_tasks()
        assert cluster.bind.call_count == 2

    @pytest.fixture
    def subject(
        self,
        zigbee_device,
        zigbee_controller: ZigbeeController,
        powerpi_logger
    ):
        return ExampleDevice(zigbee_device, zigbee_controller, powerpi_logger)

    @pytest.fixture(autouse=True)
    def cluster(self, zigbee_out_cluster: Cluster) -> Cluster:
        zigbee_out_cluster.bind = self.__make_bind()
        zigbee_out_cluster.cluster_id = OnOffCluster.cluster_id
        return zigbee_out_cluster

    @pytest.fixture
    def other_device(self, mocker: MockerFixture) -> MagicMock:
        device = mocker.MagicMock()
        type(device).ieee = PropertyMock(
            return_value=EUI64.convert('11:11:11:11:11:11:11:11')
        )
        return device

    @staticmethod
    async def __flush_tasks():
        '''Yield to the event loop twice to allow create_task and gather to complete.'''
        await sleep(0)
        await sleep(0)

    @staticmethod
    def __make_bind(exception: Exception | None = None) -> MagicMock:
        '''Create a mock bind that returns a fresh Future each call.'''
        def side_effect():
            future = Future()

            if exception:
                future.set_exception(exception)
            else:
                future.set_result(True)

            return future

        return MagicMock(side_effect=side_effect)
