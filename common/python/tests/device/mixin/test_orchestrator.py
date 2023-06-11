from typing import Dict, List, Union

import pytest
from powerpi_common_test.device.mixin import DeviceOrchestratorMixinTestBase

from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import DeviceOrchestratorMixin
from powerpi_common.mqtt.consumer import MQTTConsumer
from powerpi_common.util.data import Range


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


class TestDeviceOrchestratorMixin(DeviceOrchestratorMixinTestBase):

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

    @pytest.mark.asyncio
    @pytest.mark.parametrize('brightness', [True, False])
    @pytest.mark.parametrize('temperature', [Range(1000, 2000), False])
    @pytest.mark.parametrize('colour', [True, False])
    async def test_on_referenced_device_capability_called(
        self,
        subject: DeviceImpl,
        devices: List[str],
        brightness: bool,
        temperature: Union[Range, bool],
        colour: bool
    ):
        # pylint: disable=too-many-arguments

        assert subject.supports_brightness is False
        assert subject.supports_colour_temperature is False
        assert subject.supports_colour_hue_and_saturation is False

        await subject.initialise()

        message = {
            'timestamp': 0
        }

        if brightness:
            message['brightness'] = True

        if temperature or colour:
            message['colour'] = {}

            if temperature:
                message['colour']['temperature'] = {
                    'min': 1000,
                    'max': 2000,
                }

            if colour:
                message['colour']['hue'] = True
                message['colour']['saturation'] = True

        await self.consumers['device/device0/capability'] \
            .on_message(message, devices[0], 'capability')

        assert subject.supports_brightness is brightness
        assert subject.supports_colour_hue_and_saturation is colour

        if temperature is False:
            assert subject.supports_colour_temperature is False
        else:
            assert subject.supports_colour_temperature.min == temperature.min
            assert subject.supports_colour_temperature.max == temperature.max

        # now test an update
        message = {'timestamp': 0}

        await self.consumers['device/device0/capability'] \
            .on_message(message, devices[0], 'capability')

        assert subject.supports_brightness is False
        assert subject.supports_colour_temperature is False
        assert subject.supports_colour_hue_and_saturation is False

    @pytest.mark.asyncio
    async def test_on_referenced_device_capability_many_temperatures(
        self,
        subject: DeviceImpl,
        devices: List[str],
    ):
        assert subject.supports_colour_temperature is False

        await subject.initialise()

        message = {
            'timestamp': 0,
            'colour': {
                'temperature': {
                    'min': 1000,
                    'max': 2000
                }
            }
        }

        await self.consumers['device/device0/capability'] \
            .on_message(message, devices[0], 'capability')

        assert subject.supports_colour_temperature.min == 1000
        assert subject.supports_colour_temperature.max == 2000

        # now add another which should extend the range

        message = {
            'timestamp': 0,
            'colour': {
                'temperature': {
                    'min': 999,
                    'max': 2001
                }
            }
        }

        await self.consumers['device/device2/capability'] \
            .on_message(message, devices[2], 'capability')

        assert subject.supports_colour_temperature.min == 999
        assert subject.supports_colour_temperature.max == 2001

        # now add another which shouldn't change anything

        message = {
            'timestamp': 0,
            'colour': {
                'temperature': {
                    'min': 1001,
                    'max': 1999
                }
            }
        }

        await self.consumers['device/device1/capability'] \
            .on_message(message, devices[1], 'capability')

        assert subject.supports_colour_temperature.min == 999
        assert subject.supports_colour_temperature.max == 2001

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
    def device_manager(self, powerpi_device_manager):
        def get_device(device_name: str):
            return DummyDevice(device_name)

        powerpi_device_manager.get_device = get_device

        return powerpi_device_manager
