from powerpi_common.device import Device


class LogDevice(Device):
    def __init__(
        self,
        message: str,
        **kwargs
    ):
        Device.__init__(self, **kwargs)

        self.__message = message

    async def _turn_on(self):
        self.log_info(f'{self}: on: {self.__message}')

    async def _turn_off(self):
        self.log_info(f'{self}: off: {self.__message}')
