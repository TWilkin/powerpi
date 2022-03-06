import pytest

from pytest_mock import MockerFixture

from energenie_controller.device.socket_group import SocketGroupDevice
from powerpi_common.device import Device
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase
from powerpi_common_test.mqtt import mock_producer


class MockSocket(Device):
    def __init__(self, config, logger, mqtt_client, name):
        Device.__init__(self, config, logger, mqtt_client, name=name)
    
    def _turn_on(self):
        pass

    def _turn_off(self):
        pass


class TestSocketGroupDevice(DeviceTestBase, DeviceOrchestratorMixinTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()
        self.energenie = mocker.Mock()

        self.publish = mock_producer(mocker, self.mqtt_client)

        self.sockets = { f'socket{i}': MockSocket(
            self.config, self.logger, self.mqtt_client, f'socket{i}'
        ) for i in range(0, 4)}

        self.device_manager.get_device = lambda name: self.sockets[name]

        self.devices = self.sockets.keys()

        return SocketGroupDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, self.energenie, 
            name='socket_group', devices=self.devices, retries=2, delay=0
        )
    
    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_turn_x_only_updates_state_once(self, mocker: MockerFixture, state: str):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'
        for socket in self.sockets.values():
            assert socket.state == 'unknown'

        # call it twice so we can check the messages
        func = subject.turn_on if state == 'on' else subject.turn_off
        await func()
        await func()

        assert subject.state == state
        for socket in self.sockets.values():
            assert socket.state == state
        
        # 2 for the group (turn_x always broadcasts) and 1 for each socket
        assert self.publish.call_count == 2 + len(self.sockets)

        calls = [
            mocker.call(f'device/{name}/status', {'state': state})
            for name in self.devices
        ]
        calls.extend([
            mocker.call('device/socket_group/status', {'state': state})
            for _ in range(0, 2)
        ])
        self.publish.assert_has_calls(calls)

    @pytest.mark.parametrize('state', ['on', 'off'])
    async def test_run_updates_devices(self, mocker: MockerFixture, state: str):
        subject = self.create_subject(mocker)

        self.counter = 0
        def func():
            self.counter += 1

        for socket in self.sockets.values():
            assert socket.state == 'unknown'

        await subject._run(func, state)

        # we retry twice by default
        assert self.counter == 2

        for socket in self.sockets.values():
            assert socket.state == state
    
    @pytest.mark.parametrize('state', ['on', 'off', 'unknown'])
    def test_on_referenced_device_status(self, mocker: MockerFixture, state: str):
        subject = self.create_subject(mocker)

        assert subject.state == 'unknown'

        sockets = [socket for socket in self.sockets.values()]
        for device in sockets[:-1]:
            device.state = state
            subject.on_referenced_device_status(device.name, state)

            assert subject.state == 'unknown'
        
        sockets[-1].state = state
        subject.on_referenced_device_status(sockets[-1].name, state)

        assert subject.state == state
