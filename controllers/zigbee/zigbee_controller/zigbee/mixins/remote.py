from enum import StrEnum, unique
from typing import Callable, NamedTuple

from powerpi_common.device.mixin import InitialisableMixin
from zigpy.device import Device as ZigPyDevice

from zigbee_controller.zigbee.cluster_listener import ClusterCommandListener
from .sleepy import BindCluster


@unique
class Button(StrEnum):
    UP = 'up'
    LEFT = 'left'
    MIDDLE = 'middle'
    RIGHT = 'right'
    DOWN = 'down'
    # When there is only one button on the device
    BUTTON = 'button'


@unique
class PressType(StrEnum):
    # A momentary press when the switch supports long presses
    SHORT = 'short'
    # A longer press
    LONG = 'long'
    # A double press
    DOUBLE = 'double'
    # A single press when the switch suports hold/release long presses
    SINGLE = 'single'
    # The start of a long press when they are separate events
    HOLD = 'hold'
    # The end of a long press when they are separate events
    RELEASE = 'release'


class ButtonMapKey(NamedTuple):
    endpoint: int
    cluster_id: int
    command_id: int


ButtonAction = Callable[[int, tuple], tuple[Button, PressType]]

ButtonMapping = dict[ButtonMapKey, ButtonAction]


class ZigbeeRemoteMixin(InitialisableMixin):
    '''
    Mixin to use used to setup a Remote/Switch, i.e. a device with a set of buttons that emit
    events.
    Expected to be used alongside ZigbeeMixin
    '''

    BUTTON_MAP: ButtonMapping
    BIND_CLUSTERS: list[BindCluster]

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)

        if not hasattr(cls, 'BUTTON_MAP'):
            raise TypeError(
                f'{cls.__name__} must define BUTTON_MAP'
            )

        cls.BIND_CLUSTERS = list({
            BindCluster(key.endpoint, key.cluster_id)
            for key in cls.BUTTON_MAP
        })

    async def initialise(self):
        await super().initialise()

        def make_handler(action: ButtonAction):
            def handler(_, command_id: int, args: tuple):
                button, press_type = action(command_id, args)

                self.__button_press_handler(button, press_type)

            return handler

        device: ZigPyDevice = self._zigbee_device

        for key, action in self.BUTTON_MAP.items():
            device[key.endpoint].out_clusters[key.cluster_id].add_listener(
                ClusterCommandListener(make_handler(action))
            )

    def __button_press_handler(self, button: Button, press_type: PressType):
        self.log_info(f'Received {press_type} press of {button}')

        message = {
            'button': button,
            'type': press_type
        }

        self._broadcast('press', message)
