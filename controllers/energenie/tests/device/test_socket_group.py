from typing import Dict, List
from unittest.mock import MagicMock

import pytest
from powerpi_common.device import Device
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase
from pytest_mock import MockerFixture

from energenie_controller.device.socket_group import SocketGroupDevice


class MockSocket(Device):
    def __init__(self, config, logger, mqtt_client, name):
        Device.__init__(self, config, logger, mqtt_client, name=name)

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass


class TestSocketGroupDevice(DeviceTestBase, DeviceOrchestratorMixinTestBase):

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_turn_x_only_updates_state_once(
        self,
        subject: SocketGroupDevice,
        sockets: Dict[str, MockSocket],
        powerpi_mqtt_producer: MagicMock,
        mocker: MockerFixture,
        state: str
    ):
        # pylint: disable=too-many-arguments

        assert subject.state == 'unknown'
        for socket in sockets.values():
            assert socket.state == 'unknown'

        # call it twice so we can check the messages
        func = subject.turn_on if state == 'on' else subject.turn_off
        await func()
        await func()

        assert subject.state == state
        for socket in sockets.values():
            assert socket.state == state

        # 2 for the group (turn_x always broadcasts) and 1 for each socket
        assert powerpi_mqtt_producer.call_count == 2 + len(sockets)

        calls = [
            mocker.call(f'device/{name}/status', {'state': state})
            for name in sockets.keys()
        ]
        calls.extend([
            mocker.call('device/socket_group/status', {'state': state})
            for _ in range(0, 2)
        ])
        powerpi_mqtt_producer.assert_has_calls(calls)

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_run_updates_devices(
        self,
        subject: SocketGroupDevice,
        sockets: Dict[str, MockSocket],
        state: str
    ):
        counter = 0

        def func():
            nonlocal counter
            counter += 1

        for socket in sockets.values():
            assert socket.state == 'unknown'

        # pylint: disable=protected-access
        await subject._run(func, state)

        # we retry twice by default
        assert counter == 2

        for socket in sockets.values():
            assert socket.state == state

    @pytest.mark.asyncio
    @pytest.mark.parametrize('initial_state,update_state,expected_states', [
        ('unknown', 'on', ['unknown', 'unknown', 'unknown', 'on']),
        ('unknown', 'off', ['unknown', 'unknown', 'unknown', 'off']),
        ('unknown', 'unknown', ['unknown', 'unknown', 'unknown', 'unknown']),
        ('on', 'on', ['on', 'on', 'on', 'on']),
        ('on', 'off', ['on', 'on', 'on', 'off']),
        ('on', 'unknown', ['unknown', 'unknown', 'unknown', 'unknown']),
        ('off', 'on', ['on', 'on', 'on', 'on']),
        ('off', 'off', ['off', 'off', 'off', 'off']),
        ('off', 'unknown', ['unknown', 'unknown', 'unknown', 'unknown'])
    ])
    async def test_on_referenced_device_status(
        self,
        subject: SocketGroupDevice,
        sockets: Dict[str, MockSocket],
        initial_state: str,
        update_state: str,
        expected_states: List[str]
    ):
        assert subject.state == 'unknown'

        sockets = list(sockets.values())

        # initialise the devices
        for device in sockets:
            device.state = initial_state

        for device, expected in zip(sockets, expected_states):
            device.state = update_state
            await subject.on_referenced_device_status(device.name, update_state)

            assert subject.state == expected

        assert subject.state == update_state

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
        powerpi_device_manager,
        sockets,
        mocker: MockerFixture
    ):
        # pylint: disable=too-many-arguments

        energenie = mocker.MagicMock()

        powerpi_device_manager.get_device = lambda name: sockets[name]

        devices = sockets.keys()

        return SocketGroupDevice(
            powerpi_config,
            powerpi_logger,
            powerpi_mqtt_client,
            powerpi_device_manager,
            energenie,
            name='socket_group',
            devices=devices,
            retries=2,
            delay=0
        )

    @pytest.fixture
    def sockets(
        self,
        powerpi_config,
        powerpi_logger,
        powerpi_mqtt_client,
    ):
        return {f'socket{i}': MockSocket(
            powerpi_config, powerpi_logger, powerpi_mqtt_client, f'socket{i}'
        ) for i in range(0, 4)}
