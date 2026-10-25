from powerpi_common.controller import Controller as CommonController
from hive_controller.device import HiveClient


class Controller(CommonController):
    '''
    Custom Controller implementation for Hive controller service.
    '''

    def __init__(
        self,
        hive_client: HiveClient,
        **kwargs
    ):
        CommonController.__init__(self, **kwargs)

        self.__hive_client = hive_client

    async def _initialise_devices(self):
        await self.__hive_client.connect()
