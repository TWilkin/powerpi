from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor

from zigbee_controller.zigbee.device import ZigbeeMixin
from zigbee_controller.zigbee.mixins import ZigbeeSleepyMixin
from zigbee_controller.zigbee import ZigbeeController


class IKEAStyrbarSensor(Sensor, ZigbeeMixin, ZigbeeSleepyMixin):
    '''
    Adds support for the IKEA Styrbar.
    '''

    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)

        self._logger = logger

    async def initialise(self):
        await ZigbeeSleepyMixin.initialise(self)
