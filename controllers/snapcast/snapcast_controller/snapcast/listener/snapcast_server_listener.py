from abc import ABC, abstractmethod

from snapcast_controller.snapcast.typing import Server


class SnapcastServerListener(ABC):
    '''
    Listener for Snapcast server update events.
    '''

    @abstractmethod
    async def on_server_update(self, server: Server):
        '''Override to be notified when the server is updated.'''
        raise NotImplementedError
