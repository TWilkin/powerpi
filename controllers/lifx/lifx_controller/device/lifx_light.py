from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.mqtt import MQTTClient
from lifx_controller.device.lifx_client import LIFXClient
from lifx_controller.device.lifx_colour import LIFXColour


class LIFXLightDevice(Device, PollableMixin):
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
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )

        self.__duration = duration

        self.__light = lifx_client
        lifx_client.mac_address = mac
        lifx_client.address = hostname if hostname is not None else ip
    
    @property
    def colour(self):
        return LIFXColour(self.additional_state.get('colour'))

    def _poll(self):
        is_powered = self.__light.get_power()
        colour = self.__light.get_colour()

        changed = False
        new_state = self.state
        new_additional_state = self.additional_state

        if is_powered is not None:
            new_state = 'off' if is_powered == 0 else 'on'
            changed = new_state != self.state

        if colour is not None:
            changed |= colour != self.colour
            new_additional_state['colour'] = colour.to_json()
        
        if changed:
            self.set_state_and_additional(new_state, new_additional_state)
    
    def _change_additional_state(self, additional_state: dict):
        colour = additional_state.get('colour', None)

        if colour is not None:
            lifx_colour = LIFXColour(self.additional_state.get('colour', None))
            lifx_colour.patch(colour)

            additional_state['colour'] = lifx_colour.to_json()

            self.__light.set_colour(lifx_colour, self.__duration)
        
        return additional_state
    
    def _update_state_no_broadcast(self, new_power_state: str, new_additional_state: dict):
        colour = new_additional_state.get('colour', None)

        if colour is not None:
            new_additional_state['colour'] = colour
        
        Device._update_state_no_broadcast(self, new_power_state, new_additional_state)

    def _turn_on(self):
        self.__light.set_power(True, self.__duration)

    def _turn_off(self):
        self.__light.set_power(False, self.__duration)
