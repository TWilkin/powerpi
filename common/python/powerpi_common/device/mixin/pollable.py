from abc import ABC
from typing import Union

from powerpi_common.config.config import Config


class PollableMixin(ABC):
    '''
    Mixin to add polling functionality. The "poll" method is called periodically
    by the "DeviceStatusChecker" to update the state of a device that implements
    this mixin if the state of said device has been externally modified.
    '''

    def __init__(
        self,
        config: Config,
        poll_frequency: Union[int, None] = None,
        **_
    ):
        if poll_frequency is None:
            self.__pollable = True
            self.__poll_frequency = max(config.poll_frequency, 10)
        elif poll_frequency <= 0:
            self.__pollable = False
        else:
            self.__pollable = True
            self.__poll_frequency = max(poll_frequency, 10)

    @property
    def polling_enabled(self):
        '''
        Return whether polling is enabled for this device.
        '''
        return self.__pollable

    @property
    def poll_frequency(self):
        '''
        Return the poll frequency for this device.
        '''
        return self.__poll_frequency

    async def poll(self):
        '''
        Implement this method to support polling in a concrete device implementation.
        Must be async.
        '''
        raise NotImplementedError
