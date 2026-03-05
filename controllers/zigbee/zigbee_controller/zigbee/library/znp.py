from zigpy_znp.zigbee.application import ControllerApplication, InvalidCommandResponse
from zigpy_znp.commands import ZDO
from zigpy_znp.types import GroupId, CharacterString, Status

from .library import ZigbeeLibrary


class ZNPLibrary(ZigbeeLibrary):
    '''
    Wrapper around the ZNP ZigBee library implementation.
    '''

    def get_application(self) -> type[ControllerApplication]:
        return ControllerApplication

    async def register_group(self, controller: ControllerApplication, group_id: int):
        try:
            await controller._znp.request(
                ZDO.ExtAddGroup.Req(
                    Endpoint=1,
                    GroupId=GroupId(group_id),
                    GroupName=CharacterString(""),
                ),
                RspStatus=Status.SUCCESS,
            )
        except InvalidCommandResponse:
            # we've already added this group before
            pass
