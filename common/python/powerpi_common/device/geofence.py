from typing import TYPE_CHECKING

from powerpi_common.device.mixin import InitialisableMixin

from .types import DeviceStatus


if TYPE_CHECKING:
    from powerpi_common.variable import VariableManager


class Geofence(InitialisableMixin):
    '''
    Wrapper around variable manager and the geofence sensor identifier to check
    whether the geofence is active or not.
    '''

    def __init__(
        self,
        variable_manager: 'VariableManager',
        geofence: str | None = None
    ):
        self.__variable_manager = variable_manager
        self.__geofence = geofence

    @property
    def active(self):
        '''
        Returns whether the geofence is currently active, and therefore a device
        should not respond to commands.
        '''
        if self.__geofence is None:
            return False

        sensor = self.__get_sensor()
        if sensor is None:
            # a misconfigured geofence is always active for security
            return True

        return sensor.state == DeviceStatus.ON

    async def initialise(self):
        if self.__geofence is not None:
            _ = self.__get_sensor()

    def __get_sensor(self):
        return self.__variable_manager.get_geofence(self.__geofence)
