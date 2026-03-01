from bellows.zigbee.application import ControllerApplication

from .library import ZigbeeLibrary


class BellowsLibrary(ZigbeeLibrary):
    '''
    Wrapper around the bellows ZigBee library implementation.
    '''

    def get_application(self) -> type[ControllerApplication]:
        return ControllerApplication

    def register_groups(self, app: ControllerApplication, group_id: int):
        raise NotImplementedError
