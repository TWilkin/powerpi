from unittest.mock import MagicMock

import pytest

from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.device.mixin import CapabilityMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util.data import Range


class DeviceImpl(Device, CapabilityMixin):
    # pylint: disable=too-many-ancestors, invalid-overridden-method
    def __init__(self, *args, **kwargs):
        Device.__init__(self, *args, **kwargs)

        self.__brightness = False
        self.__temperature = False
        self.__colour = False

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass

    @CapabilityMixin.supports_brightness.getter
    def supports_brightness(self):
        return self.__brightness

    @CapabilityMixin.supports_colour_hue_and_saturation.getter
    def supports_colour_hue_and_saturation(self):
        return self.__colour

    @CapabilityMixin.supports_colour_temperature.getter
    def supports_colour_temperature(self):
        return self.__temperature

    def set_capability(self, brightness: bool, temperature: Range | bool, colour: bool):
        self.__brightness = brightness
        self.__temperature = temperature
        self.__colour = colour


class TestCapabilityMixin:
    @pytest.mark.parametrize('brightness', [True, False])
    @pytest.mark.parametrize('temperature', [Range(1000, 2000), False])
    @pytest.mark.parametrize('colour', [True, False])
    def test_on_capability_change(
        self,
        subject: DeviceImpl,
        powerpi_mqtt_producer: MagicMock,
        brightness: bool,
        temperature: Range | bool,
        colour: bool
    ):
        # pylint: disable=too-many-arguments
        assert subject.supports_brightness is False
        assert subject.supports_colour_temperature is False
        assert subject.supports_colour_hue_and_saturation is False

        subject.set_capability(brightness, temperature, colour)

        assert subject.supports_brightness is brightness
        assert subject.supports_colour_temperature is temperature
        assert subject.supports_colour_hue_and_saturation is colour

        subject.on_capability_change()

        topic = 'device/CapabilityDevice/capability'
        message = {}

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

        if brightness or temperature or colour:
            powerpi_mqtt_producer.assert_called_once_with(topic, message)
        else:
            powerpi_mqtt_producer.assert_not_called()

    @pytest.fixture
    def subject(
        self,
        powerpi_config: Config,
        powerpi_logger: Logger,
        powerpi_mqtt_client: MQTTClient
    ):
        return DeviceImpl(
            powerpi_config, powerpi_logger, powerpi_mqtt_client,
            name='CapabilityDevice'
        )
