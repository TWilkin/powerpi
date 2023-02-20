from typing import Dict, List

import pytest
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin
from powerpi_common.mqtt.consumer import MQTTConsumer
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBaseNew
from pytest_mock import MockerFixture


class DeviceImpl(Device, DeviceOrchestratorMixin):
    # pylint: disable=too-many-ancestors
    def __init__(self, config, logger, mqtt_client, device_manager, **kwargs):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        DeviceOrchestratorMixin.__init__(
            self, config, logger, mqtt_client, device_manager, **kwargs
        )

        self.current_device = None

    async def on_referenced_device_status(self, device_name: str, state: DeviceStatus):
        self.current_device = device_name
        self.state = state

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass


class DummyDevice:
    def __init__(self, name: str):
        self.name = name


class TestDeviceOrchestratorMixin(DeviceOrchestratorMixinTestBaseNew):

    @pytest.mark.asyncio
    @pytest.mark.parametrize('state', ['on', 'off', 'unknown'])
    async def test_on_referenced_device_status_called(
        self,
        subject: DeviceImpl,
        devices: List[str],
        state: str
    ):
        await subject.initialise()

        message = {
            'state': state,
            'timestamp': 0
        }

        assert subject.state == 'unknown'

        await self.consumers['device/device0/status'].on_message(message, devices[0], 'status')

        assert subject.current_device == devices[0]
        assert subject.state == state

        await self.consumers['device/device2/status'].on_message(message, devices[2], 'status')

        assert subject.current_device == devices[2]
        assert subject.state == state

    @pytest.fixture
    def subject(
        self,
        powerpi_config,
        powerpi_logger,
        mqtt_client,
        device_manager,
        devices,
    ):
        # pylint: disable=too-many-arguments
        return DeviceImpl(
            powerpi_config, powerpi_logger, mqtt_client, device_manager,
            name='orchestrator',
            devices=devices
        )

    @pytest.fixture
    def mqtt_client(self, powerpi_mqtt_client):
        self.consumers: Dict[str, MQTTConsumer] = {}

        def add_consumer(consumer: MQTTConsumer):
            self.consumers[consumer.topic] = consumer

        powerpi_mqtt_client.add_consumer = add_consumer

        return powerpi_mqtt_client

    @pytest.fixture
    def devices(self):
        return [f'device{i}' for i in range(0, 4)]

    @pytest.fixture
    def device_manager(self, mocker: MockerFixture):
        manager = mocker.Mock()

        def get_device(device_name: str):
            return DummyDevice(device_name)

        manager.get_device = get_device

        return manager
