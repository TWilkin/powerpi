from abc import ABC, abstractmethod

from powerpi_common.util import await_or_sync


class PollableMixin(ABC):
    '''
    Mixin to add polling functionality. The "poll" method is called periodically
    by the "DeviceStatusChecker" to update the state of a device that implements
    this mixin if the state of said device has been externally modified.
    '''
    async def poll(self):
        '''
        Poll for any state change for this device.
        '''
        await await_or_sync(self._poll)
    
    @abstractmethod
    def _poll(self):
        '''
        Implement this method to support polling in a concrete device implementation.
        Supports both sync and async implementations.
        '''
        raise NotImplementedError
