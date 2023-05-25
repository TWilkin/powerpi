from typing import TypedDict, Union

from lifx_controller.device.lifx_client import LIFXClient
from lifx_controller.device.lifx_colour import LIFXColour
from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice, DeviceStatus
from powerpi_common.device.mixin import (CapabilityMixin, InitialisableMixin,
                                         PollableMixin)
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.util.data import DataType


class AdditionalState(TypedDict):
    hue: int
    saturation: float
    brightness: float
    temperature: int


# pylint: disable=too-many-ancestors
class LIFXLightDevice(AdditionalStateDevice, PollableMixin, InitialisableMixin, CapabilityMixin):
    '''
    Adds support for LIFX WiFi lights.
    '''

    # pylint: disable=too-many-arguments
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        lifx_client: LIFXClient,
        mac: str,
        ip: str = None,
        hostname: str = None,
        duration: int = 500,
        **kwargs
    ):
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        PollableMixin.__init__(self, config, **kwargs)

        self.__duration = duration

        self.__light = lifx_client
        lifx_client.mac_address = mac
        lifx_client.address = hostname if hostname is not None else ip
        lifx_client.add_feature_listener(self.on_capability_change)

    @CapabilityMixin.supports_brightness.getter
    def supports_brightness(self):
        # pylint: disable=invalid-overridden-method
        return True

    @CapabilityMixin.supports_colour_hue_and_saturation.getter
    def supports_colour_hue_and_saturation(self):
        # pylint: disable=invalid-overridden-method
        return self.__light.supports_colour if self.__light.supports_colour is not None else False

    @CapabilityMixin.supports_colour_temperature.getter
    def supports_colour_temperature(self):
        # pylint: disable=invalid-overridden-method
        return self.__light.colour_temperature_range if self.__light.supports_temperature else False

    @property
    def colour(self):
        return LIFXColour.from_standard_unit(self.additional_state)

    async def initialise(self):
        try:
            # pylint: disable=bare-except
            # if we don't know what is supported, try and retrieve it
            if self.__light.supports_temperature is None or self.__light.supports_colour is None:
                await self.__light.connect()
        except:
            pass

    async def poll(self):
        is_powered: Union[int, None] = None
        colour: Union[LIFXColour, None] = None

        (is_powered, colour) = await self.__light.get_state()

        changed = False
        new_state = self.state
        new_additional_state = self.additional_state

        if is_powered is not None:
            new_state = DeviceStatus.OFF if is_powered == 0 else DeviceStatus.ON
        else:
            new_state = DeviceStatus.UNKNOWN
        changed = new_state != self.state

        if colour is not None:
            # before we compare, let's remove any disabled keys
            colour = LIFXColour(self._filter_keys(colour.to_json()))
            changed |= colour != self.colour
            new_additional_state = colour.to_standard_unit()

        if changed:
            self.set_state_and_additional(new_state, new_additional_state)

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        if new_additional_state is not None:
            lifx_colour = LIFXColour.from_standard_unit(self.additional_state)
            lifx_colour.patch(new_additional_state)

            new_additional_state = lifx_colour.to_standard_unit()

            await self.__light.set_colour(lifx_colour, self.__duration)

        return new_additional_state

    def _additional_state_keys(self):
        keys = [DataType.BRIGHTNESS]

        if self.__light.supports_temperature:
            keys.append(DataType.TEMPERATURE)
        if self.__light.supports_colour:
            keys.extend([DataType.HUE, DataType.SATURATION])

        return keys

    async def _turn_on(self):
        await self.__light.set_power(True, self.__duration)

    async def _turn_off(self):
        await self.__light.set_power(False, self.__duration)
