from abc import ABC


class PollableMixin(ABC):
    '''
    Mixin to add polling functionality. The "poll" method is called periodically
    by the "DeviceStatusChecker" to update the state of a device that implements
    this mixin if the state of said device has been externally modified.
    '''
    async def poll(self):
        '''
        Implement this method to support polling in a concrete device implementation.
        Must be async.
        '''
        raise NotImplementedError
