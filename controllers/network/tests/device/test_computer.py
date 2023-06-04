from datetime import datetime
from unittest.mock import PropertyMock, call, patch

import pytest
from powerpi_common.device import DeviceStatus
from powerpi_common_test.device import DeviceTestBaseNew
from powerpi_common_test.device.mixin import PollableMixinTestBaseNew
from pytest_mock import MockerFixture

from network_controller.device.computer import ComputerDevice


class TestComputer(DeviceTestBaseNew, PollableMixinTestBaseNew):
    def test_setup(self, subject: ComputerDevice):
        assert subject.mac_address == '00:00:00:00:00'
        assert subject.network_address == 'mycomputer.home'

    @pytest.mark.asyncio
    async def test_poll_implemented(self, subject: ComputerDevice, mocker: MockerFixture):
        # pylint: disable=arguments-differ

        host = mocker.MagicMock()
        type(host).is_alive = PropertyMock(return_value=True)

        mocker.patch(
            'network_controller.device.computer.async_ping',
            return_value=host
        )

        await subject.poll()

    @pytest.mark.asyncio
    @pytest.mark.parametrize('is_alive,state', [
        (False, DeviceStatus.OFF),
        (True, DeviceStatus.ON)
    ])
    async def test_poll_ping(
        self,
        subject: ComputerDevice,
        mocker: MockerFixture,
        is_alive: bool,
        state: DeviceStatus
    ):
        assert subject.state == DeviceStatus.UNKNOWN

        host = mocker.Mock()
        type(host).is_alive = PropertyMock(return_value=is_alive)

        mocker.patch(
            'network_controller.device.computer.async_ping',
            return_value=host
        )

        await subject.poll()

        assert subject.state == state

    @pytest.mark.asyncio
    @pytest.mark.parametrize('attempts,success', [(1, True), (3, True), (5, False)])
    @pytest.mark.timeout(60)
    async def test_turn_on(
        self,
        subject: ComputerDevice,
        mocker: MockerFixture,
        attempts: int,
        success: bool
    ):
        # pylint: disable=arguments-differ

        assert subject.state == DeviceStatus.UNKNOWN

        is_alive = [i == attempts for i in range(1, attempts + 1)]

        host = mocker.MagicMock()
        type(host).is_alive = PropertyMock(side_effect=is_alive)

        mocker.patch(
            'network_controller.device.computer.async_ping',
            return_value=host
        )

        with patch('network_controller.device.computer.send_magic_packet') as wol:
            await subject.turn_on()

            calls = [
                call('00:00:00:00:00')
                for _ in range(0, min(4, attempts))
            ]
            wol.assert_has_calls(calls)

        if success:
            assert subject.state == DeviceStatus.ON
        else:
            assert subject.state == DeviceStatus.UNKNOWN

    @ pytest.mark.asyncio
    async def test_turn_off(self, subject: ComputerDevice):
        assert subject.state == DeviceStatus.UNKNOWN

        await subject.turn_off()

        assert subject.state == DeviceStatus.UNKNOWN

    @ pytest.mark.asyncio
    async def test_change_message(
        self,
        subject: ComputerDevice,
        powerpi_config,
        mocker: MockerFixture
    ):
        # pylint: disable=arguments-differ

        assert subject.state == DeviceStatus.UNKNOWN

        mocker.patch.object(powerpi_config, 'message_age_cutoff', 120)

        host = mocker.Mock()
        type(host).is_alive = PropertyMock(return_value=True)

        mocker.patch(
            'network_controller.device.computer.async_ping',
            return_value=host
        )

        message = {
            'state': 'on',
            'timestamp': int(datetime.utcnow().timestamp() * 1000)
        }

        with patch('network_controller.device.computer.send_magic_packet'):
            await subject.on_message(message, subject.name, 'change')

        assert subject.state == DeviceStatus.ON

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client
    ):
        return ComputerDevice(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            mac='00:00:00:00:00', hostname='mycomputer.home',
            name='computer', poll_frequency=120
        )
