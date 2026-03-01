from abc import ABC, abstractmethod

from zigpy.application import ControllerApplication


class ZigbeeLibrary(ABC):
    '''
    Wrapper around a ZigBee library implementation.
    '''

    @abstractmethod
    def get_application(self) -> type[ControllerApplication]:
        '''
        Return the specific controller application implementation for this library.
        '''
        raise NotImplementedError

    @abstractmethod
    def register_groups(self, app: ControllerApplication, group_id: int):
        '''
        Use the library API directly to register the specified group.
        '''
        raise NotImplementedError
