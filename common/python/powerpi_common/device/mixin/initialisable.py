from abc import ABC

from powerpi_common.util import await_or_sync


class InitialisableMixin(ABC):
    '''
    Mixin to add initialise functionality. The "initialise" method is called on
    instantiation by "DeviceManager".
    '''
    async def initialise(self):
        '''
        Initialise this device.
        '''
        await await_or_sync(self._initialise)

    def _initialise(self):
        '''
        Implement this method to support initialisation on instantiation.
        Supports both sync and async implementations.
        '''
        raise NotImplementedError
