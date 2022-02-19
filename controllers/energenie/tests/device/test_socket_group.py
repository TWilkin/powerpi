from pytest_mock import MockerFixture

from powerpi_common.device import Device
from powerpi_common_test.device import DeviceTestBase
from energenie_controller.device.socket_group import SocketGroupDevice


class MockSocket(Device):
    def __init__(self, config, logger, mqtt_client):
        Device.__init__(self, config, logger, mqtt_client, name='socket')
    
    def _poll(self):
        pass
    
    def _turn_on(self):
        pass

    def _turn_off(self):
        pass


class TestSocketGroupDevice(DeviceTestBase):
    def get_subject(self, mocker: MockerFixture):
        self.config = mocker.Mock()
        self.logger = mocker.Mock()
        self.mqtt_client = mocker.Mock()
        self.device_manager = mocker.Mock()
        self.energenie = mocker.Mock()

        self.socket = MockSocket(
            self.config, self.logger, self.mqtt_client
        )
        mocker.patch.object(
            self.device_manager, 'get_device', return_value=self.socket
        )

        self.devices = ['device1', 'device2']

        return SocketGroupDevice(
            self.config, self.logger, self.mqtt_client, self.device_manager, self.energenie, 
            name='test', devices=self.devices, retries=2, delay=0
        )

    async def test_run_updates_devices(self, mocker: MockerFixture):
        subject = self.get_subject(mocker)

        self.counter = 0

        def func():
            self.counter += 1

        assert self.socket.state == 'unknown'

        await subject._run(func, 'on')

        assert self.counter == 2

        self.device_manager.get_device.assert_has_calls([
            mocker.call(self.devices[0]),
            mocker.call(self.devices[1])
        ])

        assert self.socket.state == 'on'
