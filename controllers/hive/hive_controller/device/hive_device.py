from apyhiveapi.helper.hivedataclasses import Device

from .hive_client import HiveClient


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

    @property
    def hive_device(self) -> Device | None:
        '''
        Find the Hive device that relates to this PowerPi device/sensor.
        '''
        return next(
            device
            for device in self._hive_client.devices
            if device.hive_name == self.name
        )
