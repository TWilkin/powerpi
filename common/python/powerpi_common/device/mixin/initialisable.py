from abc import ABC


class InitialisableMixin(ABC):
    '''
    Mixin to add initialise functionality. The "initialise" method is called on
    instantiation by "DeviceManager".
    '''
    async def initialise(self):
        '''
        Implement this method to support initialisation on instantiation.
        Must be async.
        '''
        raise NotImplementedError
