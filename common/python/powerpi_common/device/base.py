from powerpi_common.logger import LogMixin


class BaseDevice(LogMixin):
    '''
    Abstact base class for both "devices" and "sensors".
    '''

    def __init__(self, name: str, display_name: str = None, **_):
        self._name = name
        self._display_name = display_name if display_name is not None else name

    @property
    def name(self):
        '''
        Returns the unique name identifier for this device/sensor.
        '''
        return self._name

    @property
    def display_name(self):
        '''
        Returns the display name for this device/sensor.
        '''
        return self._display_name

    def __str__(self):
        return f'{type(self).__name__}({self._display_name})'

    def log_debug(self, *args):
        LogMixin.log_debug(self, *self.__update_log_message(*args))

    def log_info(self, *args):
        LogMixin.log_info(self, *self.__update_log_message(*args))

    def log_warning(self, *args):
        LogMixin.log_warning(self, *self.__update_log_message(*args))

    def log_error(self, *args):
        LogMixin.log_error(self, *self.__update_log_message(*args))

    def log_exception(self, *args):
        LogMixin.log_exception(self, *self.__update_log_message(*args))

    def __update_log_message(self, *args):
        message = f'[{self._name}]: {args[0]}'
        return (message,) + args[1:]
