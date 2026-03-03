from bellows.zigbee.application import ControllerApplication

from .library import ZigbeeLibrary


class BellowsLibrary(ZigbeeLibrary):
    '''
    Wrapper around the bellows ZigBee library implementation.
    '''

    def get_application(self) -> type[ControllerApplication]:
        return ControllerApplication

    async def register_group(self, controller: ControllerApplication, group_id: int):
        pass
