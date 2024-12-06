from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from zigbee_controller.device.zigbee_controller import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin


class ZigbeeSocket(Device, PollableMixin, ZigbeeMixin):
    '''
    Add support for ZigBee sockets.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        controller: ZigbeeController,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

    async def poll(self):
        pass

    async def initialise(self):
        pass

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass

    def __str__(self):
        return ZigbeeMixin.__str__(self)
