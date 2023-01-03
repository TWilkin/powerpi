from enum import Enum

from powerpi_common.device.types import DeviceStatus


class OnOff(int, Enum):
    OFF = 0x00
    ON = 0x01

    @classmethod
    def get(cls, state: DeviceStatus):
        return OnOff.OFF if state == DeviceStatus.OFF \
            else OnOff.ON if state == DeviceStatus.ON \
            else None


class OpenClose(str, Enum):
    CLOSE = 'close'
    OPEN = 'open'
