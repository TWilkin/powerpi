from typing import Dict, Union

from powerpi_common.device import DeviceManager
from powerpi_common.device.manager import DeviceNotFoundException
from powerpi_common.logger import Logger
from powerpi_common.typing import DeviceType, SensorType
from powerpi_common.variable.device import DeviceVariable
from powerpi_common.variable.sensor import SensorVariable
from powerpi_common.variable.types import VariableType


class VariableManager:
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
        self.__logger = logger
        self.__device_manager = device_manager
        self.__service_provider = service_provider

        self.__variables: Dict[VariableType, Dict[str, DeviceVariable]] = {}

        for variable_type in VariableType:
            self.__variables[variable_type] = {}

    def get_device(self, name: str) -> Union[DeviceVariable, DeviceType]:
        '''
        Returns the device variable if it exists, or the actual device if that exists.
        '''
        return self.__get(VariableType.DEVICE, name)

    def get_sensor(self, name: str) -> Union[SensorVariable, SensorType]:
        '''
        Returns the sensor variable if it exists, or the actual sensor if that exists.
        '''
        return self.__get(VariableType.SENSOR, name)

    def __add(self, variable_type: VariableType, name: str):
        variable_attribute = f'{variable_type}_variable'

        factory = getattr(self.__service_provider, variable_attribute, None)

        if factory is None:
            self.__logger.debug(
                f'Could not find variable type "{variable_type}'
            )
            return None

        instance = factory(name)

        self.__variables[variable_type][name] = instance

        return instance

    def __get(self, variable_type: VariableType, name: str):
        try:
            return self.__variables[variable_type][name]
        except KeyError:
            # no variable yet, so try getting it from DeviceManager
            try:
                if variable_type == VariableType.DEVICE:
                    return self.__device_manager.get_device(name)

                if variable_type == VariableType.SENSOR:
                    return self.__device_manager.get_sensor(name)
            except DeviceNotFoundException:
                pass

            # no local device, so let's create a variable
            return self.__add(variable_type, name)
