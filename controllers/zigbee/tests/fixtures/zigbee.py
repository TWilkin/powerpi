from unittest.mock import PropertyMock

import pytest
from pytest_mock import MockerFixture
from zigpy.endpoint import Endpoint
from zigpy.profiles.zha import DeviceType
from zigpy.zcl import Cluster

from zigbee_controller.config import ZigbeeConfig
from zigbee_controller.zigbee import ZigbeeController

# pylint: disable=redefined-outer-name


@pytest.fixture
def zigbee_config(powerpi_config) -> ZigbeeConfig:
    powerpi_config.database_path = '/var/data/zigbee.db'
    powerpi_config.zigbee_device = '/dev/ttyACM0'

    powerpi_config.zigbee_library = 'znp'
    powerpi_config.baudrate = None
    powerpi_config.flow_control = None

    return powerpi_config


@pytest.fixture
def zigbee_controller(mocker: MockerFixture, zigbee_device: DeviceType) -> ZigbeeController:
    controller = mocker.MagicMock()

    controller.get_device = lambda _, __: zigbee_device

    return controller


@pytest.fixture
def zigbee_device(mocker: MockerFixture, zigbee_endpoint: Endpoint) -> DeviceType:
    device = mocker.MagicMock()

    endpoint_0 = mocker.MagicMock()
    type(device).endpoints = PropertyMock(
        return_value={0: endpoint_0, 1: zigbee_endpoint}
    )

    device.__getitem__.side_effect = lambda _: zigbee_endpoint

    return device


@pytest.fixture
def zigbee_endpoint(mocker: MockerFixture) -> Endpoint:
    endpoint = mocker.MagicMock()

    return endpoint


@pytest.fixture
def zigbee_in_cluster(mocker: MockerFixture, zigbee_endpoint: Endpoint) -> Cluster:
    cluster = mocker.MagicMock()

    clusters = mocker.MagicMock()
    clusters.__getitem__.side_effect = lambda _: cluster

    type(zigbee_endpoint).in_clusters = PropertyMock(
        return_value=clusters
    )

    return cluster


@pytest.fixture
def zigbee_out_cluster(mocker: MockerFixture, zigbee_endpoint: Endpoint) -> Cluster:
    cluster = mocker.MagicMock()

    clusters = mocker.MagicMock()
    clusters.__getitem__.side_effect = lambda _: cluster

    type(zigbee_endpoint).out_clusters = PropertyMock(
        return_value=clusters
    )

    return cluster
