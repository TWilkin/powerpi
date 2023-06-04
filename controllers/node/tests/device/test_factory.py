from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.device.types import DeviceConfigType
from pytest_mock import MockerFixture

from node_controller.device.factory import NodeDeviceFactory


class TestNodeDeviceFactory:
    @pytest.mark.parametrize('name', ['node123', 'NODE123', 'Node123'])
    def test_build_local(self, subject: NodeDeviceFactory, name: str):
        result = subject.build(DeviceConfigType.DEVICE, 'node', name=name)

        assert result == 'local'

    def test_build_remote(self, subject: NodeDeviceFactory):
        result = subject.build(DeviceConfigType.DEVICE, 'node', name='Node321')

        assert result == 'remote'

    def test_build_other(self, subject: NodeDeviceFactory):
        result = subject.build(
            DeviceConfigType.DEVICE,
            'nodey',
            name='Node123'
        )

        assert result == 'nodey'

    def test_build_sensor(self, subject: NodeDeviceFactory):
        result = subject.build(
            DeviceConfigType.SENSOR,
            'node',
            name='Node123'
        )

        assert result == 'sensor'

    @pytest.fixture
    def mock_config(self, powerpi_config):
        type(powerpi_config).node_hostname = PropertyMock(
            return_value='NODE123')

        return powerpi_config

    @pytest.fixture
    def mock_service_provider(self, mocker: MockerFixture):
        service_provider = mocker.Mock()

        service_provider.local_node_device = lambda **_: 'local'
        service_provider.remote_node_device = lambda **_: 'remote'
        service_provider.nodey_device = lambda **_: 'nodey'
        service_provider.node_sensor = lambda **_: 'sensor'

        return service_provider

    @pytest.fixture
    def subject(
        self,
        mock_config: MagicMock,
        mock_service_provider: MagicMock,
        mocker: MockerFixture
    ):
        return NodeDeviceFactory(mock_config, mocker.Mock(), mock_service_provider)
