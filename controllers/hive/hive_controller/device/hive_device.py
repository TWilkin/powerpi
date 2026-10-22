from dataclasses import dataclass
from dacite import from_dict

from .hive_client import HiveClient


@dataclass
class DeviceData:
    battery: int | None


@dataclass
class HiveDevice:
    hive_name: str
    hive_type: str
    data: DeviceData


ALIAS_MAP = {
    'hiveName': 'hive_name',
    'hiveType': 'hive_type',
    'deviceData': 'data',
    'battery': 'battery'
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
        self._hive_client = hive_client

    def get_hive_device(self, hive_type: str) -> HiveDevice | None:
        '''
        Find the Hive device that relates to this PowerPi device/sensor.
        '''
        def remap_recursive(data: dict) -> dict | list:
            if isinstance(data, dict):
                return {
                    ALIAS_MAP.get(key, key): remap_recursive(value)
                    for key, value in data.items()
                }

            if isinstance(data, list):
                return [remap_recursive(item) for item in data]

            return data

        for device_dict in self._hive_client.devices:
            aliased = remap_recursive(device_dict)

            device: HiveDevice = from_dict(HiveDevice, aliased)

            if device.hive_name == self.name and device.hive_type == hive_type:
                return device

        return None
