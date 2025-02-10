from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ZigbeeMixin
from zigbee_controller.zigbee.mixins import Button, ButtonConfig, PressType, RemoteConfig, ZigbeeRemoteMixin


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
        return RemoteConfig(
            buttons=[
                ButtonConfig(
                    cluster_id=OnOffCluster.cluster_id,
                    endpoint_id=1,
                    button=Button.BUTTON
                )
            ],
            press_types={
                'toggle': PressType.SHORT,
                'off': PressType.LONG,
                'on': PressType.DOUBLE
            }
        )

    def __str__(self):
        return ZigbeeMixin.__str__(self)
