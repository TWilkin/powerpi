from enum import Enum
from typing import Any, Dict, List, Union

from powerpi_common.logger import Logger, LogMixin


class DeltaType(str, Enum):
    BRIGHTNESS = 'brightness'
    HUE = 'hue'
    SATURATION = 'saturation'
    TEMPERATURE = 'temperature'


class DeviceSchedule(LogMixin):
    # pylint: disable=too-many-instance-attributes
    '''
    Service to schedule and run a device's schedule from the schedules.json configuration file.
    '''

    def __init__(
        self,
        logger: Logger,
        device_schedule: Dict[str, Any]
    ):
        self._logger = logger

        self.__parse(device_schedule)

    def start(self):
        self.log_info(self)

    def __parse(self, device_schedule: Dict[str, Any]):
        self.__device = device_schedule['device']
        self.__between = device_schedule['between']
        self.__interval = int(device_schedule['interval'])

        self.__days = device_schedule['days'] if 'days' in device_schedule \
            else []

        self.__delta: Dict[DeltaType, List[Union[int, float]]] = {}

        for delta_type in [DeltaType.BRIGHTNESS, DeltaType.TEMPERATURE]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = [
                    int(value) for value in device_schedule[delta_type]
                ]

        for delta_type in [DeltaType.HUE, DeltaType.SATURATION]:
            if delta_type in device_schedule:
                self.__delta[delta_type] = [
                    float(value) for value in device_schedule[delta_type]
                ]

        self.__power = bool(device_schedule['power']) if 'power' in device_schedule \
            else False

    def __str__(self):
        builder = f'Every {self.__interval}s between {self.__between[0]} and {self.__between[1]}'

        if self.__days:
            days = ', '.join(self.__days)
            builder += f' on {days}'
        else:
            builder += ' every day'

        builder += f' adjust {self.__device}'

        for device_type, values in self.__delta.items():
            builder += f' {device_type} between {values[0]} and {values[1]}'

        if self.__power:
            builder += ' and turn it on'

        return builder
