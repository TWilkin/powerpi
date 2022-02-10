from enum import Enum
from typing import List

from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from powerpi_common.sensor import Sensor
from zigbee_controller.device import ZigbeeController
from zigbee_controller.zigbee import ClusterListener, ZigbeeDevice


class OsramSwitchMiniSensor(Sensor, ZigbeeDevice):
    ''' Adds support for Osram Smart+ Switch Mini
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

        /event/NAME/press:{"button": "down", "type": "hold"}
        /event/NAME/press:{"button": "down", "type": "release"}
    '''

    class Button(str, Enum):
        UP = 'up',
        MIDDLE = 'middle',
        DOWN = 'down'
    
    class PressType(str, Enum):
        SINGLE = 'single',
        HOLD = 'hold',
        RELEASE = 'release'
    
    def __init__(
        self,
        logger: Logger,
        controller: ZigbeeController,
        mqtt_client: MQTTClient,
        ieee: str,
        nwk: str,
        name: str, 
        location: str = None,
        display_name: str = None,
        entity: str = None,
        action: str = None,
        visible: bool = False,
    ):
        Sensor.__init__(self, mqtt_client, name, location, display_name, entity, action, visible)
        ZigbeeDevice.__init__(self, controller, ieee, nwk)

        self.__logger = logger

        self.__register()
    
    def __button_press_handler(self, button: Button, press_type: PressType):
        self.__logger.info(f'Received {press_type} press of {button}')

        message = {
            'button': button,
            'type': press_type
        }
        self._broadcast('press', message)
    
    def __long_button_press_handler(self, button: Button, args: List[List[int]]):
        # identify which press it is
        press_type = self.PressType.HOLD if len(args) == 1 and len(args[0]) == 2 and args[0][1] == 38 \
            else self.PressType.RELEASE

        self.__button_press_handler(button, press_type)

    def __register(self):
        device = self._zigbee_device

        # single press
        device[1].out_clusters[6].add_listener(
            ClusterListener(lambda _, __, ___: self.__button_press_handler(self.Button.UP, self.PressType.SINGLE))
        )
        device[2].out_clusters[6].add_listener(
            ClusterListener(lambda _, __, ___: self.__button_press_handler(self.Button.DOWN, self.PressType.SINGLE))
        )
        device[3].out_clusters[8].add_listener(
            ClusterListener(lambda _, __, ___: self.__button_press_handler(self.Button.MIDDLE, self.PressType.SINGLE))
        )

        # long press
        device[1].out_clusters[8].add_listener(
            ClusterListener(lambda _, __, args: self.__long_button_press_handler(self.Button.UP, args))
        )
        device[2].out_clusters[8].add_listener(
            ClusterListener(lambda _, __, args: self.__long_button_press_handler(self.Button.DOWN, args))
        )
    
    def __str__(self):
        return ZigbeeDevice.__str__(self)
