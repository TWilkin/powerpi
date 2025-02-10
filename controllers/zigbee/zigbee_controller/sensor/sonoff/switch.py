from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin
from zigbee_controller.zigbee.mixins import Button, PressType, ZigbeeRemoteMixin


class SonoffSwitchSensor(Sensor, ZigbeeRemoteMixin, ZigbeeMixin):
    '''
    Adds support for Sonoff Switch.
    '''

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

    def _remote_config(self):
        return {
            'buttons': [
                {
                    'cluster_id': OnOffCluster.cluster_id,
                    'endpoint_id': 1,
                    'button': Button.BUTTON
                }
            ],
            'press_type': {
                2: PressType.SHORT,
                0: PressType.LONG,
                1: PressType.DOUBLE
            }
        }

    def __str__(self):
        return ZigbeeMixin.__str__(self)
