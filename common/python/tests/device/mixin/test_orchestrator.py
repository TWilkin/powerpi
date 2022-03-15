import pytest

from pytest_mock import MockerFixture

from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin
from powerpi_common_test.device import DeviceTestBase
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase


class DeviceImpl(Device, DeviceOrchestratorMixin):
    def __init__(self, config, logger, mqtt_client, device_manager, **kwargs):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, **kwargs
        )

        self.current_device = None

    async def on_referenced_device_status(self, device_name: str, state: DeviceStatus):
        self.current_device = device_name
        self.state = state

    def _turn_on(self):
        pass

    def _turn_off(self):
        pass


class DummyDevice:
    def __init__(self, name: str):
        self.name = name


class TestDeviceOrchestratorMixin(DeviceTestBase, DeviceOrchestratorMixinTestBase):
    pytestmark = pytest.mark.asyncio

    def get_subject(self, mocker: MockerFixture):
        self.device_manager = mocker.Mock()

        self.devices = [f'device{i}' for i in range(0, 4)]

        device = DeviceImpl(
            self.config, self.logger, self.mqtt_client, self.device_manager,
            name='orchestrator',
            devices=self.devices
        )

        return device

    @pytest.mark.parametrize('state', ['on', 'off', 'unknown'])
    async def test_on_referenced_device_status_called(self, mocker: MockerFixture, state: str):
        self.consumers = {}

        def mock_add_consumer():
            def add_consumer(consumer):
                self.consumers[consumer.topic] = consumer

            self.mqtt_client.add_consumer = add_consumer

        subject = self.create_subject(mocker, mock_add_consumer)

        def get_device(device_name: str):
            return DummyDevice(device_name)
        self.device_manager.get_device = get_device

        await subject.initialise()

        message = {
            'state': state,
            'timestamp': 0
        }

        assert subject.state == 'unknown'

        await self.consumers['device/device0/status'].on_message(message, self.devices[0], 'status')

        assert subject.current_device == self.devices[0]
        assert subject.state == state

        await self.consumers['device/device2/status'].on_message(message, self.devices[2], 'status')

        assert subject.current_device == self.devices[2]
        assert subject.state == state
