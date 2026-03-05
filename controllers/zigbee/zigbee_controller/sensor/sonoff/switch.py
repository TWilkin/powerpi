from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.zigbee import ZigbeeController, ZigbeeMixin
from zigbee_controller.zigbee.mixins import ButtonMapKey, Button, PressType, ZigbeeRemoteMixin


class SonoffSwitchSensor(Sensor, ZigbeeMixin, ZigbeeRemoteMixin):
    '''
    Adds support for Sonoff Switch.
    '''

    BUTTON_MAP = {
        ButtonMapKey(1, OnOffCluster.cluster_id, 0x00): lambda _: (Button.BUTTON, PressType.LONG),
        ButtonMapKey(1, OnOffCluster.cluster_id, 0x01): lambda _: (Button.BUTTON, PressType.DOUBLE),
        ButtonMapKey(1, OnOffCluster.cluster_id, 0x02): lambda _: (Button.BUTTON, PressType.SHORT),
    }

    def __init__(
        self,
        logger: Logger,
        zigbee_controller: ZigbeeController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, zigbee_controller, **kwargs)

        self._logger = logger

    def __str__(self):
        return ZigbeeMixin.__str__(self)
