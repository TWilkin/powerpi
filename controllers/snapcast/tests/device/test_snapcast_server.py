from asyncio import Future
from typing import List, Tuple
from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import (InitialisableMixinTestBase,
                                              PollableMixinTestBase)
from pytest_mock import MockerFixture

from snapcast_controller.device.snapcast_server import SnapcastServerDevice


class TestSnapcastServerDevice(DeviceTestBase, InitialisableMixinTestBase, PollableMixinTestBase):
    @pytest.mark.asyncio
    async def test_turn_off(self, subject: SnapcastServerDevice):
        # override as this device doesn't support off
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_off()

        assert subject.state == DeviceStatus.UNKNOWN

    def test_network_address_ip(self, subject: SnapcastServerDevice):
        assert subject.network_address == '127.0.0.1'

    @pytest.mark.parametrize('subject', [('Server.home', None)], indirect=['subject'])
    def test_network_address_hostname(self, subject: SnapcastServerDevice):
        assert subject.network_address == 'Server.home'

    def test_port_defaults(self, subject: SnapcastServerDevice):
        assert subject.port == 1780

    @pytest.mark.parametrize('subject', [(None, 1234)], indirect=['subject'])
    def test_port_set(self, subject: SnapcastServerDevice):
        assert subject.port == 1234

    def test_api(self, subject: SnapcastServerDevice, snapcast_api):
        assert subject.api == snapcast_api

    def test_clients_empty(self, subject: SnapcastServerDevice):
        result = subject.clients

        assert result is not None
        assert len(result) == 0

    def test_clients_populate(
        self,
        subject: SnapcastServerDevice,
        clients: List[MagicMock]
    ):
        result = subject.clients

        assert result is not None
        assert len(result) == len(clients)

    @pytest.mark.asyncio
    async def test_initialise_connects_and_listens(
        self,
        subject: SnapcastServerDevice,
        snapcast_api: MagicMock
    ):
        await subject.initialise()

        snapcast_api.connect.assert_called_once_with('127.0.0.1', 1780)
        snapcast_api.add_listener.assert_called_once_with(subject)

    @pytest.mark.asyncio
    async def test_deinitialise_connects_and_listens(
        self,
        subject: SnapcastServerDevice,
        snapcast_api: MagicMock
    ):
        await subject.deinitialise()

        snapcast_api.disconnect.assert_called_once()
        snapcast_api.remove_listener.assert_called_once_with(subject)

    @pytest.mark.asyncio
    async def test_on_server_update(
        self,
        subject: SnapcastServerDevice,
        snapcast_server: MagicMock,
        clients: List[MagicMock],
        mocker: MockerFixture
    ):
        def has_streams(streams: List[str]):
            for client in clients:
                assert client.streams == streams

        await subject.on_server_update(snapcast_server)

        # new streams
        streams = [mocker.MagicMock() for _ in range(0, 2)]
        type(snapcast_server).streams = PropertyMock(return_value=streams)

        type(streams[0]).id = PropertyMock(return_value='Stream 0')
        type(streams[1]).id = PropertyMock(return_value='Stream 1')

        await subject.on_server_update(snapcast_server)

        has_streams(['Stream 0', 'Stream 1'])

        # remove and add
        type(streams[0]).id = PropertyMock(return_value='Another Stream')

        await subject.on_server_update(snapcast_server)

        has_streams(['Another Stream', 'Stream 1'])

    @pytest.fixture(scope='function')
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager,
        snapcast_api,
        request: Tuple[str | None, int | None]
    ):
        # pylint: disable=too-many-arguments
        return SnapcastServerDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_device_manager,
            snapcast_api,
            ip='127.0.0.1'
            if not hasattr(request, 'param') or request.param[0] is None
            else None,
            hostname=request.param[0] if hasattr(request, 'param') else None,
            port=request.param[1] if hasattr(request, 'param') else None,
            name='SnapcastServer', poll_frequency=10
        )

    @pytest.fixture(autouse=True)
    def snapcast_status(
        self,
        snapcast_api: MagicMock,
        snapcast_server: MagicMock,
        mocker: MockerFixture
    ):
        status = mocker.MagicMock()
        type(status).server = PropertyMock(return_value=snapcast_server)

        future = Future()
        future.set_result(status)

        snapcast_api.get_status.return_value = future

    @pytest.fixture
    def snapcast_server(self, mocker: MockerFixture):
        server = mocker.MagicMock()

        return server

    @pytest.fixture
    def clients(self, powerpi_device_manager: MagicMock, mocker: MockerFixture):
        devices = [mocker.MagicMock() for _ in range(0, 4)]

        def init(device: MagicMock, name: str, server_name: str | None = None):
            type(device).name = PropertyMock(return_value=name)

            if server_name is not None:
                type(device).server_name = PropertyMock(
                    return_value=server_name)

        init(devices[0], 'FirstClient', 'SnapcastServer')
        init(devices[1], 'OtherClient', 'OtherServer')
        init(devices[2], 'SecondClient', 'SnapcastServer')
        init(devices[3], 'OtherDevice')

        powerpi_device_manager.devices = {
            device.name: device for device in devices
        }

        return [devices[0], devices[2]]
