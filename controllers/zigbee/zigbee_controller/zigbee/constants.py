from enum import Enum

from powerpi_common.device.types import DeviceStatus
from zigpy.zcl.clusters.general import OnOff as OnOffCluster


class OnOff(int, Enum):
    OFF = OnOffCluster.commands_by_name['off'].id
    ON = OnOffCluster.commands_by_name['on'].id

    @classmethod
    def get(cls, state: DeviceStatus):
        return OnOff.OFF if state == DeviceStatus.OFF \
            else OnOff.ON if state == DeviceStatus.ON \
            else None


class OpenClose(str, Enum):
    CLOSE = 'close'
    OPEN = 'open'
