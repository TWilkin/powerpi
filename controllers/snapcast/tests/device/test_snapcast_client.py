from asyncio import Future
from typing import Tuple
from unittest.mock import MagicMock, PropertyMock

import pytest
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import InitialisableMixinTestBase
from pytest_mock import MockerFixture

from snapcast_controller.device.snapcast_client import SnapcastClientDevice


class TestSnapcastClientDevice(DeviceTestBase, InitialisableMixinTestBase):
    # pylint: disable=too-many-public-methods

    __client_id = 'The Client Id'

    @pytest.mark.asyncio
    async def test_turn_on(self, subject: SnapcastClientDevice):
        # override as this device doesn't support on
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_on()

        assert subject.state == DeviceStatus.UNKNOWN

    def test_server_name(self, subject: SnapcastClientDevice):
        assert subject.server_name == 'MyServer'

    def test_mac(self, subject: SnapcastClientDevice):
        assert subject.mac == '00:00:00:00:00'

    def test_host_id_unset(self, subject: SnapcastClientDevice):
        assert subject.host_id == 'MyClient'

    def test_host_id_set(
        self,
        subject_with_host_id: SnapcastClientDevice
    ):
        assert subject_with_host_id.host_id == 'Client.home'

    @pytest.mark.asyncio
    async def test_initialise_add_listener(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock
    ):
        await subject.initialise()

        snapcast_api.add_listener.assert_called_once_with(subject)

    @pytest.mark.asyncio
    async def test_deinitialise_remove_listener(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock
    ):
        await subject.deinitialise()

        snapcast_api.remove_listener.assert_called_once_with(subject)

    @pytest.mark.asyncio
    async def test_on_additional_state_change_unsupported(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock,
    ):
        result = await subject.on_additional_state_change({'other': 'MyStream'})

        assert result == {}

        snapcast_api.set_group_clients.assert_not_called()
        snapcast_api.set_group_stream.assert_not_called()

    @pytest.mark.asyncio
    async def test_on_additional_state_change_no_stream(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock,
    ):
        result = await subject.on_additional_state_change({'stream': 'MyStream'})

        assert result == {}

        snapcast_api.set_group_clients.assert_not_called()
        snapcast_api.set_group_stream.assert_not_called()

    @pytest.mark.asyncio
    async def test_on_additional_state_change_no_groups(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock,
        mocker: MockerFixture
    ):
        status = mocker.MagicMock()
        group = mocker.MagicMock()

        type(status).server = mocker.MagicMock()
        type(status.server).streams = ['OtherStream', 'MyStream']
        type(status.server).groups = [group]
        type(group).stream_id = 'OtherStream'

        future = Future()
        future.set_result(status)
        snapcast_api.status.return_value = future

        result = await subject.on_additional_state_change({'stream': 'MyStream'})

        assert result == {}

        snapcast_api.set_group_clients.assert_not_called()
        snapcast_api.set_group_stream.assert_not_called()

    @pytest.mark.asyncio
    async def test_on_additional_state_change_group_playing(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock,
        snapcast_client: Tuple[MagicMock, MagicMock],
        mocker: MockerFixture,
    ):
        client, host = snapcast_client
        type(host).mac = '00:00:00:00:00'

        status = mocker.MagicMock()

        group1 = mocker.MagicMock()
        type(group1).id = 'Group1'
        type(group1).stream_id = 'OtherStream'

        group2 = mocker.MagicMock()
        type(group2).id = 'Group2'
        type(group2).stream_id = 'MyStream'
        group_client = mocker.MagicMock()
        type(group_client).id = 'Existing Client Id'
        type(group2).clients = [group_client]

        stream1 = mocker.MagicMock()
        type(stream1).id = PropertyMock(return_value='OtherStream')
        stream2 = mocker.MagicMock()
        type(stream2).id = PropertyMock(return_value='MyStream')

        type(status).server = mocker.MagicMock()
        type(status.server).streams = [stream1, stream2]
        type(status.server).groups = [group1, group2]

        future = Future()
        future.set_result(status)
        snapcast_api.get_status.return_value = future

        snapcast_api.set_group_clients.return_value = future

        await subject.on_client_connect(client)

        result = await subject.on_additional_state_change({'stream': 'MyStream'})

        assert result == {'stream': 'MyStream'}

        snapcast_api.set_group_clients.assert_called_once_with(
            'Group2', ['Existing Client Id', self.__client_id]
        )
        snapcast_api.set_group_stream.assert_not_called()

    @pytest.mark.asyncio
    async def test_on_additional_state_change_already_in_group(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock,
        snapcast_client: Tuple[MagicMock, MagicMock],
        mocker: MockerFixture,
    ):
        client, host = snapcast_client
        type(host).mac = '00:00:00:00:00'

        status = mocker.MagicMock()

        group1 = mocker.MagicMock()
        type(group1).id = 'Group1'
        type(group1).stream_id = 'OtherStream'

        group2 = mocker.MagicMock()
        type(group2).id = 'Group2'
        type(group2).stream_id = 'OtherStream'
        group_client = mocker.MagicMock()
        type(group_client).id = self.__client_id
        type(group2).clients = [group_client]

        stream1 = mocker.MagicMock()
        type(stream1).id = PropertyMock(return_value='OtherStream')
        stream2 = mocker.MagicMock()
        type(stream2).id = PropertyMock(return_value='MyStream')

        type(status).server = mocker.MagicMock()
        type(status.server).streams = [stream1, stream2]
        type(status.server).groups = [group1, group2]

        future = Future()
        future.set_result(status)
        snapcast_api.get_status.return_value = future

        snapcast_api.set_group_stream.return_value = future

        await subject.on_client_connect(client)

        result = await subject.on_additional_state_change({'stream': 'MyStream'})

        assert result == {'stream': 'MyStream'}

        snapcast_api.set_group_stream.assert_called_once_with(
            'Group2', 'MyStream'
        )
        snapcast_api.set_group_clients.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('mac,success', [('12:34:56:78:90', False), ('00:00:00:00:00', True)])
    async def test_on_client_connect_by_mac(
        self,
        subject: SnapcastClientDevice,
        snapcast_api: MagicMock,
        snapcast_client: Tuple[MagicMock, MagicMock],
        mac: str,
        success: bool
    ):
        # pylint: disable=too-many-arguments

        client, host = snapcast_client
        type(host).mac = mac

        future = Future()
        future.set_result(True)
        snapcast_api.set_client_name.return_value = future

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.on_client_connect(client)

        assert subject.state == DeviceStatus.ON if success else DeviceStatus.UNKNOWN

        if success:
            snapcast_api.set_client_name.assert_called_once_with(
                self.__client_id, 'MyClient'
            )
        else:
            snapcast_api.set_client_name.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('host_id,success', [('Nope.home', False), ('Client.home', True)])
    async def test_on_client_connect_by_host_id(
        self,
        subject_with_host_id: SnapcastClientDevice,
        snapcast_api: MagicMock,
        snapcast_client: Tuple[MagicMock, MagicMock],
        host_id: str,
        success: bool
    ):
        # pylint: disable=too-many-arguments
        subject = subject_with_host_id

        client, host = snapcast_client
        type(host).name = host_id

        future = Future()
        future.set_result(True)
        snapcast_api.set_client_name.return_value = future

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.on_client_connect(client)

        assert subject.state == DeviceStatus.ON if success else DeviceStatus.UNKNOWN

        if success:
            snapcast_api.set_client_name.assert_called_once_with(
                self.__client_id, 'MyClient'
            )
        else:
            snapcast_api.set_client_name.assert_not_called()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('mac,success', [('12:34:56:78:90', False), ('00:00:00:00:00', True)])
    async def test_on_client_disconnect(
        self,
        subject: SnapcastClientDevice,
        mocker: MockerFixture,
        mac: str,
        success: bool
    ):
        client = mocker.MagicMock()
        host = mocker.MagicMock()

        type(client).host = PropertyMock(return_value=host)
        type(host).mac = mac

        assert subject.state == DeviceStatus.UNKNOWN

        await subject.on_client_disconnect(client)

        assert subject.state == DeviceStatus.OFF if success else DeviceStatus.UNKNOWN

    @pytest.mark.asyncio
    async def test_on_group_stream_changed(self, subject: SnapcastClientDevice):
        assert subject.additional_state.get('stream') is None

        # changes to the new stream
        await subject.on_group_stream_changed('MyStream')
        assert subject.additional_state.get('stream') == 'MyStream'

        # repeating it does nothing
        await subject.on_group_stream_changed('MyStream')
        assert subject.additional_state.get('stream') == 'MyStream'

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager,
        snapcast_server  # pylint: disable=unused-argument
    ):
        # pylint: disable=too-many-arguments
        return SnapcastClientDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, powerpi_device_manager,
            server='MyServer', mac='00:00:00:00:00',
            name='MyClient'
        )

    @pytest.fixture
    def subject_with_host_id(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager,
        snapcast_server  # pylint: disable=unused-argument
    ):
        # pylint: disable=too-many-arguments
        return SnapcastClientDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, powerpi_device_manager,
            server='MyServer', host_id='Client.home',
            name='MyClient'
        )

    @pytest.fixture
    def snapcast_server(self, powerpi_device_manager, mocker: MockerFixture):
        server = mocker.MagicMock()

        type(server).name = PropertyMock(return_value='MyServer')

        powerpi_device_manager.get_device = lambda name: server if name == 'MyServer' else None

        return server

    @pytest.fixture
    def snapcast_api(self, snapcast_server: MagicMock, mocker: MockerFixture):
        api = mocker.MagicMock()

        type(snapcast_server).api = PropertyMock(return_value=api)

        return api

    @pytest.fixture
    def snapcast_client(self, snapcast_api: MagicMock, mocker: MockerFixture):
        client = mocker.MagicMock()
        client_id = self.__client_id
        host = mocker.MagicMock()

        type(client).host = PropertyMock(return_value=host)
        type(client).id = PropertyMock(return_value=client_id)

        future = Future()
        future.set_result(True)
        snapcast_api.set_client_name.return_value = future

        return (client, host)
