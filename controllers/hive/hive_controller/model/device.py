from dataclasses import dataclass
from enum import StrEnum, unique

from powerpi_common.device import DeviceStatus

from hive_controller.util import parse


ALIAS_MAP = {
    'hiveName': 'hive_name',
    'hiveType': 'hive_type',
    'deviceData': 'data',
    'battery': 'battery',
    'temperatureunit': '_temperature_unit',
    'mode': '_mode',
    'boost': '_boost'
}


@unique
class Mode(StrEnum):
    SCHEDULE = 'schedule'
    MANUAL = 'manual'


@dataclass
class DeviceData:
    battery: int | None


@dataclass
class Status:
    current_temperature: float
    target_temperature: float
    _state: str | None
    _mode: str
    _boost: str

    @property
    def state(self):
        return self.__parse_boolean(self._state)

    @state.setter
    def state(self, new_state: str):
        self._state = new_state

    @property
    def mode(self):
        if self._mode == 'SCHEDULE':
            return Mode.SCHEDULE
        if self._mode == 'MANUAL':
            return Mode.MANUAL
        return self._mode

    @property
    def boost(self):
        return self.__parse_boolean(self._boost)

    def __parse_boolean(self, boolean: str):
        if boolean == 'ON':
            return DeviceStatus.ON
        if boolean == 'OFF':
            return DeviceStatus.OFF
        return DeviceStatus.UNKNOWN


@dataclass
class HiveDevice:
    hive_name: str
    hive_type: str
    data: DeviceData
    status: Status | None
    _temperature_unit: str | None

    @property
    def temperature_unit(self):
        if self._temperature_unit is None or self._temperature_unit == 'C':
            return '°C'

        return self._temperature_unit

    @staticmethod
    def parse(data: dict):
        return parse(HiveDevice, ALIAS_MAP, data)
