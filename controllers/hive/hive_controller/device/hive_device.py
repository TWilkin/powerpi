from powerpi_common.device.mixin import InitialisableMixin

from hive_controller.model import HiveDevice

from .hive_client import HiveClient


class HiveDeviceMixin(InitialisableMixin):
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
        return HiveDevice.parse(self.__get_hive_device('Battery'))

    async def heating_device(self):
        device = self.__get_hive_device('heating')

        if device is not None:
            data = await self.__hive_client.client.heating.getClimate(device)
            result = HiveDevice.parse(data)

            result.status.state = await self.__hive_client.client.heating.getState(device)

            return result

        return None

    async def initialise(self):
        await self.__hive_client.set_update_interval(self.poll_frequency)

    def __get_hive_device(self, hive_type: str) -> dict | None:
        '''
        Find the Hive device that relates to this PowerPi device/sensor.
        '''
        for device in self.__hive_client.devices:
            if device['hiveName'] == self.name and device['hiveType'] == hive_type:
                return device

        return None
