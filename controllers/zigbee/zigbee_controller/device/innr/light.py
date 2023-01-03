from powerpi_common.config import Config
from powerpi_common.device import AdditionalStateDevice
from powerpi_common.device.mixin import AdditionalState, PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin


#pylint: disable=too-many-ancestors
class InnrLight(AdditionalStateDevice, PollableMixin, ZigbeeMixin):
    '''
    Adds support for Innr Smart RGB bulb.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        controller: ZigbeeController,
        **kwargs
    ):
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client, **kwargs
        )
        PollableMixin.__init__(self, config, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

    async def poll(self):
        pass

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        pass

    def _additional_state_keys(self):
        # TODO find a way to dynamically identify which are supported by the bulb
        return ['brightness', 'temperature', 'hue', 'saturation']

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass
