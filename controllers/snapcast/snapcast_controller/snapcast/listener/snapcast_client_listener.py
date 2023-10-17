from abc import ABC

from snapcast_controller.snapcast.typing import Client


class SnapcastClientListener(ABC):
    def on_client_connect(self, client: Client):
        '''Override to be notified when a client connects to the Snapcast server.'''

    def on_client_disconnect(self, client: Client):
        '''Override to be notified when a client disconnects to the Snapcast server.'''
