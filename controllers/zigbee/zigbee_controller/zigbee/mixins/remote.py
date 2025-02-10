from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import StrEnum, unique
from typing import Dict, List

from zigpy.zcl.clusters import Cluster

from zigbee_controller.zigbee import ClusterCommandListener


@unique
class Button(StrEnum):
    BUTTON = 'button'
    UP = 'up'
    RIGHT = 'right'
    DOWN = 'down'
    LEFT = 'left'


@unique
class PressType(StrEnum):
    SHORT = 'short'
    LONG = 'long'
    DOUBLE = 'double'


@dataclass
class ButtonConfig:
    cluster_id: int
    endpoint_id: int
    button: Button


@dataclass
class RemoteConfig:
    buttons: List[ButtonConfig]
    press_types: Dict[str, PressType]


class ZigbeeRemoteMixin(ABC):
    '''
    Mixin to be used to configure a sensor to be a remote, where button presses are broadcast
    to the message queue so the event service can handle them.
    Expected to be used alongside ZigbeeMixin.
    '''

    async def initialise(self):
        device = self._zigbee_device

        config = self._remote_config()

        def get_command(cluster: Cluster, command_id: int):
            command = next(filter(
                lambda command: command.id == command_id,
                cluster.commands
            ))

            if command is not None:
                return config.press_types[command.name]

            return None

        for button in config.buttons:
            cluster: Cluster = device[button.endpoint_id].out_clusters[button.cluster_id]

            cluster.add_listener(
                ClusterCommandListener(lambda _, command_id, __, button=button, cluster=cluster:
                                       self._button_press_handler(
                                           button.button,
                                           get_command(cluster, command_id)
                                       )
                                       )
            )

    @abstractmethod
    def _remote_config(self) -> RemoteConfig:
        '''
        Override to supply the remote configuration.
        '''
        raise NotImplementedError

    def _button_press_handler(self, button: Button, press_type: PressType):
        self.log_info(f'Received {press_type} press of {button}')

        message = {
            'button': button,
            'type': press_type
        }

        self._broadcast('press', message)
