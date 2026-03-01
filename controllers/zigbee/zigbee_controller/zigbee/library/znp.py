from zigpy_znp.zigbee.application import ControllerApplication

from .library import ZigbeeLibrary


class ZNPLibrary(ZigbeeLibrary):
    '''
    Wrapper around the ZNP ZigBee library implementation.
    '''

    def get_application(self) -> type[ControllerApplication]:
        return ControllerApplication

    def register_groups(self, app: ControllerApplication, group_id: int):
        raise NotImplementedError
