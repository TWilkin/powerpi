from abc import ABC, abstractmethod

from snapcast_controller.snapcast.typing import Client


class SnapcastClientListener(ABC):
    '''
    Listener for Snapcast client connect and disconnect events.
    '''

    @abstractmethod
    async def on_client_connect(self, client: Client):
        '''Override to be notified when a client connects to the Snapcast server.'''
        raise NotImplementedError

    @abstractmethod
    async def on_client_disconnect(self, client: Client):
        '''Override to be notified when a client disconnects to the Snapcast server.'''
        raise NotImplementedError
