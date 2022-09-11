from typing import TypedDict, Union

from lifx_controller.device.lifx_client import LIFXClient
from lifx_controller.device.lifx_colour import LIFXColour
from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice, DeviceStatus
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class AdditionalState(TypedDict):
    hue: int
    saturation: int
    brightness: int
    temperature: int


#pylint: disable=too-many-ancestors
class LIFXLightDevice(AdditionalStateDevice, PollableMixin):
    #pylint: disable=too-many-arguments
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

    @property
    def colour(self):
        return LIFXColour(self.additional_state)

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
            new_additional_state = colour.to_json()

        if changed:
            self.set_state_and_additional(new_state, new_additional_state)

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        if new_additional_state is not None:
            lifx_colour = LIFXColour(self.additional_state)
            lifx_colour.patch(new_additional_state)

            new_additional_state = lifx_colour.to_json()

            await self.__light.set_colour(lifx_colour, self.__duration)

        return new_additional_state

    def _additional_state_keys(self):
        keys = ['brightness']

        if self.__light.supports_temperature:
            keys.append('temperature')
        if self.__light.supports_colour:
            keys.extend(['hue', 'saturation'])

        return keys

    async def _turn_on(self):
        await self.__light.set_power(True, self.__duration)

    async def _turn_off(self):
        await self.__light.set_power(False, self.__duration)
