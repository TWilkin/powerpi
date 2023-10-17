from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from .snapcast_api import SnapcastAPI


class SnapcastServerDevice(Device, InitialisableMixin):
    '''
    Device for getting and sending data from the snapcast server.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        snapcast_api: SnapcastAPI,
        ip: str | None = None,
        hostname: str | None = None,
        port: int | None = 1780,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__api = snapcast_api

        self.__network_address = ip if ip is not None else hostname
        self.__port = port

    async def initialise(self):
        await self.__api.connect(self.network_address, self.port)

    async def deinitialise(self):
        await self.__api.disconnect()

    @property
    def network_address(self):
        return self.__network_address

    @property
    def port(self):
        return self.__port

    async def _turn_on(self):
        # this device doesn't support on/off
        pass

    async def _turn_off(self):
        # this device doesn't support on/off
        pass
