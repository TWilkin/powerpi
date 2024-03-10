from enum import IntEnum, StrEnum, unique

from powerpi_common.device.types import DeviceStatus
from zigpy.zcl.clusters.general import OnOff as OnOffCluster


@unique
class OnOff(IntEnum):
    OFF = OnOffCluster.commands_by_name['off'].id
    ON = OnOffCluster.commands_by_name['on'].id

    @classmethod
    def get(cls, state: DeviceStatus):
        return OnOff.OFF if state == DeviceStatus.OFF \
            else OnOff.ON if state == DeviceStatus.ON \
            else None


@unique
class OpenClose(StrEnum):
    CLOSE = 'close'
    OPEN = 'open'
