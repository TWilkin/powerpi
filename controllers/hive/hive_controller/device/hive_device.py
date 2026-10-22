from dataclasses import dataclass
from enum import StrEnum, unique

from dacite import from_dict
from powerpi_common.device import DeviceStatus

from .hive_client import HiveClient


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
    _mode: str
    _boost: str

    @property
    def mode(self):
        if self._mode == 'SCHEDULE':
            return Mode.SCHEDULE
        if self._mode == 'MANUAL':
            return Mode.MANUAL
        return self._mode

    @property
    def boost(self):
        if self._boost == 'ON':
            return DeviceStatus.ON
        if self._boost == 'OFF':
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


ALIAS_MAP = {
    'hiveName': 'hive_name',
    'hiveType': 'hive_type',
    'deviceData': 'data',
    'battery': 'battery',
    'temperatureunit': '_temperature_unit',
    'mode': '_mode',
    'boost': '_boost'
}


class HiveDeviceMixin:
    '''
    Mixin to support common methods for all Hive devices/sensors.
    '''

    def __init__(
        self,
        hive_client: HiveClient,
        **_
    ):
        self.__hive_client = hive_client

    @property
    def battery_device(self):
        return self.__parse_device(self.__get_hive_device('Battery'))

    async def heating_device(self):
        device = self.__get_hive_device('heating')

        if device is not None:
            data = await self.__hive_client.client.heating.getClimate(device)
            return self.__parse_device(data)

        return None

    def __get_hive_device(self, hive_type: str) -> HiveDevice | None:
        '''
        Find the Hive device that relates to this PowerPi device/sensor.
        '''
        for device in self.__hive_client.devices:
            if device['hiveName'] == self.name and device['hiveType'] == hive_type:
                return device

        return None

    def __parse_device(self, device_dict: dict) -> HiveDevice:
        def remap_recursive(data: dict) -> dict | list:
            if isinstance(data, dict):
                return {
                    ALIAS_MAP.get(key, key): remap_recursive(value)
                    for key, value in data.items()
                }

            if isinstance(data, list):
                return [remap_recursive(item) for item in data]

            return data

        aliased = remap_recursive(device_dict)

        return from_dict(HiveDevice, aliased)
