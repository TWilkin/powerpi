from enum import IntEnum, StrEnum, unique

from powerpi_common.device.types import DeviceStatus
from zigpy.zcl.clusters.general import OnOff as OnOffCluster


@unique
class OnOff(IntEnum):
    OFF = OnOffCluster.commands_by_name['off'].id
    ON = OnOffCluster.commands_by_name['on'].id

    @classmethod
    def get(cls, state: DeviceStatus):
        if state == DeviceStatus.OFF:
            return OnOff.OFF

        if state == DeviceStatus.ON:
            return OnOff.ON

        return None


@unique
class OpenClose(StrEnum):
    CLOSE = 'close'
    OPEN = 'open'
