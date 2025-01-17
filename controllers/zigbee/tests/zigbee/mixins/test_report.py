from asyncio import Future
from typing import List, Tuple
from unittest.mock import PropertyMock

import pytest
from powerpi_common.logger import Logger, LogMixin
from pytest_mock import MockerFixture
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Attribute, GeneralCommand, Status

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterGeneralCommandListener
from zigbee_controller.zigbee.mixins import ZigbeeReportMixin


class ExampleSensor(ZigbeeReportMixin, LogMixin):
    def __init__(self, device, controller: ZigbeeController, powerpi_logger):
        self.__device = device
        self.__controller = controller
        self._logger = powerpi_logger

        self.report_called: List[Tuple[Cluster, Attribute]] = []

    @property
    def _zigbee_device(self):
        return self.__device

    @property
    def _zigbee_controller(self):
        return self.__controller

    def on_report(self, cluster: Cluster, attribute: Attribute):
        self.report_called.append((cluster, attribute))

    async def register_reports(self, cluster: Cluster, attributes: List[str], frequency: int):
        await self._register_reports(cluster, attributes, frequency)


class TestZigbeeReportMixin:
    @pytest.mark.asyncio
    async def test_register_reports(
        self,
        subject: ExampleSensor,
        cluster: Cluster,
        zigbee_controller: ZigbeeController,
        powerpi_logger: Logger,
        mocker: MockerFixture
    ):
        future = Future()
        future.set_result(self.create_report_response(
            [Status.SUCCESS, Status.SUCCESS, Status.SUCCESS],
            mocker
        ))
        cluster.configure_reporting_multiple.return_value = future

        attributes = ['A', 'B', 'C']
        frequency = 123

        await subject.register_reports(cluster, attributes, frequency)

        cluster.bind.assert_called_once()
        cluster.configure_reporting_multiple.assert_called_once()
        cluster.add_listener.assert_called_once()

        zigbee_controller.add_listener.assert_called_once()

        powerpi_logger.info.assert_called_once_with(
            'Registered %d report(s)', 3
        )
        powerpi_logger.warning.assert_not_called()

        # calling the listener works
        listener: ClusterGeneralCommandListener = cluster.add_listener.call_args_list[
            0].args[0]
        listener.general_command(
            self.create_zcl_header(GeneralCommand.Report_Attributes, mocker),
            self.create_report([1, 2, 3], mocker)
        )
        assert subject.report_called == [
            (cluster, 1),
            (cluster, 2),
            (cluster, 3)
        ]

    @pytest.mark.asyncio
    async def test_register_reports_not_all_success(
        self,
        subject: ExampleSensor,
        cluster: Cluster,
        zigbee_controller: ZigbeeController,
        powerpi_logger: Logger,
        mocker: MockerFixture
    ):
        future = Future()
        future.set_result(self.create_report_response(
            [Status.SUCCESS, Status.ABORT, Status.SUCCESS],
            mocker
        ))
        cluster.configure_reporting_multiple.return_value = future

        attributes = ['A', 'B', 'C']
        frequency = 123

        await subject.register_reports(cluster, attributes, frequency)

        cluster.bind.assert_called_once()
        cluster.configure_reporting_multiple.assert_called_once()
        cluster.add_listener.assert_called_once()

        zigbee_controller.add_listener.assert_called_once()

        powerpi_logger.warning.assert_called_once_with(
            'Registered %d of %d report(s), will try again later', 2, 3
        )
        powerpi_logger.info.assert_not_called()

    @pytest.mark.asyncio
    async def test_register_reports_throws(
        self,
        subject: ExampleSensor,
        cluster: Cluster,
        zigbee_controller: ZigbeeController,
        powerpi_logger: Logger
    ):
        future = Future()
        future.set_exception(TimeoutError('Boom'))
        cluster.configure_reporting_multiple.return_value = future

        attributes = ['A', 'B', 'C']
        frequency = 123

        await subject.register_reports(cluster, attributes, frequency)

        cluster.bind.assert_called_once()
        cluster.configure_reporting_multiple.assert_called_once()
        cluster.add_listener.assert_called_once()

        zigbee_controller.add_listener.assert_called_once()

        powerpi_logger.warning.assert_called_once()
        powerpi_logger.warning.assert_called_once_with(
            'Bind failed, likely the device is not on, will try again when it rejoins'
        )
        powerpi_logger.info.assert_not_called()

    @pytest.mark.asyncio
    async def test_register_reports_no_attributes(
        self,
        subject: ExampleSensor,
        cluster: Cluster,
        zigbee_controller: ZigbeeController,
        powerpi_logger: Logger
    ):
        attributes = []
        frequency = 123

        await subject.register_reports(cluster, attributes, frequency)

        cluster.bind.assert_not_called()
        cluster.configure_reporting_multiple.assert_not_called()
        cluster.add_listener.assert_not_called()

        zigbee_controller.add_listener.assert_not_called()

        powerpi_logger.warning.assert_not_called()
        powerpi_logger.info.assert_not_called()

    @pytest.fixture
    def subject(self, zigbee_device, zigbee_controller: ZigbeeController, powerpi_logger):
        return ExampleSensor(zigbee_device, zigbee_controller, powerpi_logger)

    @pytest.fixture
    def cluster(self, zigbee_in_cluster: Cluster):
        future = Future()
        future.set_result(True)
        zigbee_in_cluster.bind.return_value = future

        return zigbee_in_cluster

    def create_report_response(self, statuses: List[Status], mocker: MockerFixture):
        response = mocker.MagicMock()

        records = []
        for status in statuses:
            record = mocker.MagicMock()
            records.append(record)

            type(record).status = PropertyMock(return_value=status)

        type(response).status_records = PropertyMock(return_value=records)

        return response

    def create_zcl_header(self, command_id: int, mocker: MockerFixture):
        header = mocker.MagicMock()

        type(header).command_id = PropertyMock(return_value=command_id)

        return header

    def create_report(self, attributes: List[Attribute], mocker: MockerFixture):
        report = mocker.MagicMock()

        type(report).attribute_reports = PropertyMock(return_value=attributes)

        return report
