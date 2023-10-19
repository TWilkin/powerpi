from abc import ABC


class SnapcastGroupListener(ABC):
    async def on_group_stream_changed(self, stream_id: str):
        '''Override to be notified when a group changes the stream it's playing.'''
        raise NotImplementedError
