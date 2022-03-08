from abc import ABC


class InitialisableMixin(ABC):
    '''
    Mixin to add initialise functionality. The "initialise" method is called on
    instantiation by "DeviceManager".
    '''
    def initialise(self):
        '''
        Implement tis method to support initialisation on instantiation.
        '''
        raise NotImplementedError
