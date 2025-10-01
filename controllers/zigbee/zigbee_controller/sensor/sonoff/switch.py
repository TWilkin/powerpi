from enum import StrEnum, unique

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigpy.zcl.clusters.general import OnOff as OnOffCluster

from zigbee_controller.zigbee import ClusterCommandListener, ZigbeeController, ZigbeeMixin


@unique
class PressType(StrEnum):
    SHORT = 'short'
    DOUBLE = 'double'
    LONG = 'long'


class SonoffSwitchSensor(Sensor, ZigbeeMixin):
    '''
    Adds support for Sonoff Switch.
    '''

    __press_map = {
        0: PressType.LONG,
        1: PressType.DOUBLE,
        2: PressType.SHORT
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

    async def initialise(self):
        device = self._zigbee_device

        device[1].out_clusters[OnOffCluster.cluster_id].add_listener(
            ClusterCommandListener(lambda _, press_type_int, __: self.button_press_handler(
                press_type_int
            ))
        )

    def button_press_handler(self, press_type_int: int):
        press_type = self.__press_map[press_type_int]

        self.log_info(f'Received {press_type} press')

        message = {
            'button': 'button',
            'type': press_type
        }

        self._broadcast('press', message)

    def __str__(self):
        return ZigbeeMixin.__str__(self)
