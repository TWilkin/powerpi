from abc import ABC


class Variable(ABC):
    '''
    Abstract base class for a variable, which can monitor a remote device or sensor to allow its
    state to be used when activating other devices.
    '''
