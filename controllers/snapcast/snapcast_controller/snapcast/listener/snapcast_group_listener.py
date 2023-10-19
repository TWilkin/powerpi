from abc import ABC, abstractmethod


class SnapcastGroupListener(ABC):
    '''
    Listener for Snapcast group events.
    '''

    @abstractmethod
    async def on_group_stream_changed(self, stream_id: str):
        '''Override to be notified when a group changes the stream it's playing.'''
        raise NotImplementedError
