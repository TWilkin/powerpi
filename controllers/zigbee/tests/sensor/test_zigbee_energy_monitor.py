from asyncio import Future
from dataclasses import dataclass
from typing import List
from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from powerpi_common_test.sensor import SensorTestBase
from pytest_mock import MockerFixture
from zigpy.zcl.clusters import Cluster
from zigpy.zcl.foundation import Status, TypeValue

from zigbee_controller.sensor import ZigbeeEnergyMonitorSensor


@dataclass
class Attribute:
    id: int


class TestZigbeeEnergyMonitor(SensorTestBase, InitialisableMixinTestBase):
    @pytest.mark.parametrize('attribute_id,action,unit,value,expected', [
        (10, 'power', 'W', 123, True),
        (20, 'current', 'A', 123, True),
        (20, 'current', 'A', 0xFFFF, False),
        (30, 'voltage', 'V', 123, True),
        (30, 'voltage', 'V', 0xFFFF, False),
        (40, '', '', 123, False)
    ])
    def test_on_report(
        self,
        subject: ZigbeeEnergyMonitorSensor,
        powerpi_mqtt_producer: MagicMock,
        cluster: Cluster,
        mocker: MockerFixture,
        attribute_id: int,
        action: str,
        unit: str,
        value: int,
        expected: bool
    ):
        attribute = mocker.MagicMock()
        type(attribute).attrid = PropertyMock(return_value=attribute_id)
        type(attribute).value = PropertyMock(
            return_value=TypeValue(None, value)
        )

        subject.on_report(cluster, attribute)

        if expected:
            self.__verify_publish(powerpi_mqtt_producer, action, 123, unit)
        else:
            powerpi_mqtt_producer.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('attribute_id,action,unit,expected', [
        (10, 'power', 'W', 2000 / 2),
        (20, 'current', 'A', 2000 / 4),
        (30, 'voltage', 'V', 2000 / 8)
    ])
    async def test_on_report_divisors(
        self,
        subject: ZigbeeEnergyMonitorSensor,
        powerpi_mqtt_producer: MagicMock,
        cluster: Cluster,
        mocker: MockerFixture,
        attribute_id: int,
        action: str,
        unit: str,
        expected: int
    ):
        future = Future()
        future.set_result(({
            'power_divisor': 2,
            'ac_current_divisor': 4,
            'ac_voltage_divisor': 8
        }, 'ignored'))
        cluster.read_attributes.return_value = future

        await subject.initialise()

        attribute = mocker.MagicMock()
        type(attribute).attrid = PropertyMock(return_value=attribute_id)
        type(attribute).value = PropertyMock(
            return_value=TypeValue(None, 2000))

        subject.on_report(cluster, attribute)

        self.__verify_publish(powerpi_mqtt_producer, action, expected, unit)

    @pytest.mark.parametrize('attribute_id,power,current,voltage', [
        (10, 'none', 'read', 'visible'),
        (20, 'read', 'none', 'visible'),
        (30, 'visible', 'read', 'none')
    ])
    def test_on_report_disabled(
        self,
        powerpi_logger, zigbee_controller, powerpi_mqtt_client,
        powerpi_mqtt_producer: MagicMock,
        cluster: Cluster,
        mocker: MockerFixture,
        attribute_id: int,
        power: str,
        current: str,
        voltage: str
    ):
        subject = ZigbeeEnergyMonitorSensor(
            powerpi_logger,
            powerpi_mqtt_client,
            zigbee_controller,
            metrics={'power': power, 'current': current, 'voltage': voltage},
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA',
            name='test'
        )

        attribute = mocker.MagicMock()
        type(attribute).attrid = PropertyMock(return_value=attribute_id)
        type(attribute).value = PropertyMock(
            return_value=TypeValue(None, 2000))

        subject.on_report(cluster, attribute)

        powerpi_mqtt_producer.assert_not_called()

    def test_on_report_wrong_id(
        self,
        subject: ZigbeeEnergyMonitorSensor,
        powerpi_mqtt_producer: MagicMock,
        cluster: Cluster,
        mocker: MockerFixture
    ):
        type(cluster).cluster_id = PropertyMock(return_value=0x0000)

        attribute = mocker.MagicMock()
        type(attribute).attrid = PropertyMock(return_value=10)
        type(attribute).value = PropertyMock(
            return_value=TypeValue(None, 123)
        )

        subject.on_report(cluster, attribute)

        powerpi_mqtt_producer.assert_not_called()

    @pytest.fixture
    def subject(self, powerpi_logger, zigbee_controller, powerpi_mqtt_client):
        return ZigbeeEnergyMonitorSensor(
            powerpi_logger,
            powerpi_mqtt_client,
            zigbee_controller,
            metrics={'power': 'visible', 'current': 'read', 'voltage': 'read'},
            ieee='00:00:00:00:00:00:00:00', nwk='0xAAAA',
            name='test'
        )

    @pytest.fixture(autouse=True)
    def cluster(self, zigbee_in_cluster: Cluster, mocker: MockerFixture):
        future = Future()
        future.set_result(True)
        zigbee_in_cluster.bind.return_value = future

        future = Future()
        future.set_result(self.__create_report_response(
            [Status.SUCCESS, Status.SUCCESS, Status.SUCCESS],
            mocker
        ))
        zigbee_in_cluster.configure_reporting_multiple.return_value = future

        future = Future()
        future.set_result(({}, 'ignored'))
        zigbee_in_cluster.read_attributes.return_value = future

        type(zigbee_in_cluster).cluster_id = PropertyMock(return_value=0x0B04)
        type(zigbee_in_cluster).attributes_by_name = PropertyMock(return_value={
            'active_power': Attribute(10),
            'rms_current': Attribute(20),
            'rms_voltage': Attribute(30)
        })

        return zigbee_in_cluster

    def __create_report_response(self, statuses: List[Status], mocker: MockerFixture):
        response = mocker.MagicMock()

        records = []
        for status in statuses:
            record = mocker.MagicMock()
            records.append(record)

            type(record).status = PropertyMock(return_value=status)

        type(response).status_records = PropertyMock(return_value=records)

        return response

    def __verify_publish(
        self,
        powerpi_mqtt_producer: MagicMock,
        action: str,
        value: int,
        unit: str
    ):
        topic = f'event/test/{action}'

        message = {'value': value, 'unit': unit}

        powerpi_mqtt_producer.assert_called_once()
        powerpi_mqtt_producer.assert_called_once_with(topic, message)
