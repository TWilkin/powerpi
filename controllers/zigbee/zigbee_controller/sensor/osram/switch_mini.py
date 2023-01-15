from enum import Enum
from typing import Any, List

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from powerpi_common.sensor.mixin import BatteryMixin
from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import (ClusterAttributeListener,
                                      ClusterCommandListener, ZigbeeMixin)
from zigpy.zcl.clusters.general import LevelControl as LevelControlCluster
from zigpy.zcl.clusters.general import OnOff as OnOffCluster
from zigpy.zcl.clusters.general import \
    PowerConfiguration as PowerConfigurationCluster
from zigpy.zcl.clusters.lighting import Color as ColorCluster


class ButtonEndpoint(int, Enum):
    UP = 1
    MIDDLE = 3
    DOWN = 2


class Button(str, Enum):
    UP = 'up'
    MIDDLE = 'middle'
    DOWN = 'down'


class PressType(str, Enum):
    SINGLE = 'single'
    HOLD = 'hold'
    RELEASE = 'release'


class OsramSwitchMiniSensor(Sensor, ZigbeeMixin, BatteryMixin):
    '''
    Adds support for Osram Smart+ Switch Mini
    Generates the following events on button clicks where NAME is the
    configured name of the device.

    Single press:
    /event/NAME/press:{"button": "up", "type": "single"}
    /event/NAME/press:{"button": "middle", "type": "single"}
    /event/NAME/press:{"button": "down", "type": "single"}

    Long press generates an event pair, one when the button is pressed and
    the other when it's released:
    /event/NAME/press:{"button": "up", "type": "hold"}
    /event/NAME/press:{"button": "up", "type": "release"}

    /event/NAME/press:{"button": "middle", "type": "hold"}
    /event/NAME/press:{"button": "middle", "type": "release"}

    /event/NAME/press:{"button": "down", "type": "hold"}
    /event/NAME/press:{"button": "down", "type": "release"}
    '''

    #pylint: disable=too-many-arguments
    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Sensor.__init__(self, mqtt_client, **kwargs)
        ZigbeeMixin.__init__(self, controller, **kwargs)
        BatteryMixin.__init__(self)

        self._logger = logger

    def button_press_handler(self, button: Button, press_type: PressType):
        self.log_info(f'Received {press_type} press of {button}')

        message = {
            'button': button,
            'type': press_type
        }

        self._broadcast('press', message)

    def long_button_press_handler(self, button: Button, args: List[List[int]]):
        if len(args) == 1:
            # identify which press it is
            press_type = PressType.HOLD if len(args[0]) == 2 and args[0][1] == 38 \
                else PressType.RELEASE

            self.button_press_handler(button, press_type)

    def long_middle_button_press_handler(self, args: List[List[int]]):
        if len(args) == 1 and len(args[0]) == 2:
            # identify which press it is
            press_type = None
            if args[0][0] == 254 and args[0][1] == 2:
                press_type = PressType.HOLD
            elif args[0][0] == 0 and args[0][1] == 0:
                press_type = PressType.RELEASE
            else:
                # for some reason it generates 2 events on long press
                return

            self.button_press_handler(Button.MIDDLE, press_type)

    async def initialise(self):
        device = self._zigbee_device

        # single press
        device[ButtonEndpoint.UP].out_clusters[OnOffCluster.cluster_id].add_listener(
            ClusterCommandListener(lambda _, __, ___: self.button_press_handler(
                Button.UP, PressType.SINGLE
            ))
        )
        device[ButtonEndpoint.DOWN].out_clusters[OnOffCluster.cluster_id].add_listener(
            ClusterCommandListener(lambda _, __, ___: self.button_press_handler(
                Button.DOWN, PressType.SINGLE
            ))
        )
        device[ButtonEndpoint.MIDDLE].out_clusters[LevelControlCluster.cluster_id].add_listener(
            ClusterCommandListener(lambda _, __, ___: self.button_press_handler(
                Button.MIDDLE, PressType.SINGLE
            ))
        )

        # long press
        device[ButtonEndpoint.UP].out_clusters[LevelControlCluster.cluster_id].add_listener(
            ClusterCommandListener(
                lambda _, __, args: self.long_button_press_handler(
                    Button.UP, args
                )
            )
        )
        device[ButtonEndpoint.DOWN].out_clusters[LevelControlCluster.cluster_id].add_listener(
            ClusterCommandListener(
                lambda _, __, args: self.long_button_press_handler(
                    Button.DOWN, args
                )
            )
        )
        device[ButtonEndpoint.MIDDLE].out_clusters[ColorCluster.cluster_id].add_listener(
            ClusterCommandListener(
                lambda _, __, args: self.long_middle_button_press_handler(args)
            )
        )

        # battery level
        device[1].in_clusters[PowerConfigurationCluster.cluster_id].add_listener(
            ClusterAttributeListener(self.__on_attribute_updated)
        )

    def __on_attribute_updated(self, attribute_id: int, value: Any):
        if attribute_id == 0x0021:
            # battery level
            self.on_battery_change(value)

    def __str__(self):
        return ZigbeeMixin.__str__(self)
