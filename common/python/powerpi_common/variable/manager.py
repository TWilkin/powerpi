from typing import Dict, Optional

from powerpi_common.device import DeviceManager, DeviceNotFoundException
from powerpi_common.logger import Logger, LogMixin
from powerpi_common.typing import DeviceType, SensorType
from powerpi_common.variable.device import DeviceVariable
from powerpi_common.variable.sensor import SensorVariable
from powerpi_common.variable.types import VariableType
from powerpi_common.variable.variable import Variable


class VariableManager(LogMixin):
    '''
    Class to retrieve a variable, or if it's a local device/sensor, the actual device
    from DeviceManager, which has the live state.
    '''

    def __init__(
        self,
        logger: Logger,
        device_manager: DeviceManager,
        service_provider
    ):
        self._logger = logger
        self.__device_manager = device_manager
        self.__service_provider = service_provider

        self.__variables: Dict[
            VariableType,
            Dict[str, DeviceVariable | SensorVariable]
        ] = {}

        for variable_type in VariableType:
            self.__variables[variable_type] = {}

    def get_device(self, name: str) -> 'DeviceVariable | DeviceType':
        '''
        Returns the device variable if it exists, or the actual device if that exists.
        '''
        return self.__get(VariableType.DEVICE, name)

    def get_sensor(self, name: str, action: str) -> 'SensorVariable | SensorType':
        '''
        Returns the sensor variable if it exists, or the actual sensor if that exists.
        '''
        return self.__get(VariableType.SENSOR, name, action)

    def add(self, variable: Variable):
        variable_type = variable.variable_type
        kwargs = {}

        if variable_type == VariableType.SENSOR:
            kwargs['action'] = variable.action

        key = self.__key(variable_type, variable.name, **kwargs)
        if key in self.__variables[variable_type]:
            return False

        self.__variables[variable_type][key] = variable

        self.log_info(f'Adding variable {variable}')
        return True

    def __create(self, variable_type: VariableType, name: str, action: Optional[str]):
        variable_attribute = f'{variable_type}_variable'

        factory = getattr(self.__service_provider, variable_attribute, None)

        if factory is None:
            self.log_debug(
                f'Could not find variable type "{variable_type}"'
            )
            return None

        kwargs = {'name': name}
        if variable_type == VariableType.SENSOR:
            kwargs['action'] = action

        instance = factory(**kwargs)

        self.add(instance)

        return instance

    def __get(self, variable_type: VariableType, name: str, action: Optional[str] = None):
        key = self.__key(variable_type, name, action)

        variable = self.__variables[variable_type].get(key)
        if variable is not None:
            return variable

        # no variable yet, so try getting it from DeviceManager
        try:
            if variable_type == VariableType.DEVICE:
                return self.__device_manager.get_device(name)

            if variable_type == VariableType.SENSOR:
                return self.__device_manager.get_sensor(name)
        except DeviceNotFoundException:
            pass

        # no local device, so let's create a variable
        return self.__create(variable_type, name, action)

    @classmethod
    def __key(cls, variable_type: VariableType, name: str, action: Optional[str] = None):
        if variable_type == VariableType.DEVICE:
            return name
        if variable_type == VariableType.SENSOR and action is not None:
            return f'{name}/{action}'

        return None
