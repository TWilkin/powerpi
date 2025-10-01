from unittest.mock import PropertyMock

import pytest
from pytest_mock import MockerFixture
from zigbee_controller.zigbee import ZigbeeController
from zigpy.endpoint import Endpoint
from zigpy.typing import DeviceType
from zigpy.zcl import Cluster

# pylint: disable=redefined-outer-name


@pytest.fixture
def zigbee_controller(mocker: MockerFixture, zigbee_device: DeviceType) -> ZigbeeController:
    controller = mocker.MagicMock()

    controller.get_device = lambda _, __: zigbee_device

    return controller


@pytest.fixture
def zigbee_device(mocker: MockerFixture) -> DeviceType:
    device = mocker.MagicMock()

    return device


@pytest.fixture
def zigbee_endpoint(mocker: MockerFixture, zigbee_device: DeviceType) -> Endpoint:
    endpoint = mocker.MagicMock()

    zigbee_device.__getitem__.side_effect = lambda _: endpoint

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
