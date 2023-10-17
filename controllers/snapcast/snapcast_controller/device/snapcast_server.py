from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from snapcast_controller.snapcast.listener import SnapcastClientListener
from snapcast_controller.snapcast.snapcast_api import SnapcastAPI
from snapcast_controller.snapcast.typing import Client


class SnapcastServerDevice(Device, InitialisableMixin, SnapcastClientListener):
    # pylint: disable=too-many-ancestors

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

    @property
    def network_address(self):
        return self.__network_address

    @property
    def port(self):
        return self.__port

    async def initialise(self):
        await self.__api.connect(self.network_address, self.port)

        self.__api.add_listener(self)

    async def deinitialise(self):
        await self.__api.disconnect()

    async def _turn_on(self):
        # this device doesn't support on/off
        pass

    async def _turn_off(self):
        # this device doesn't support on/off
        pass

    def on_client_connect(self, client: Client):
        self.log_info(client)

    def on_client_disconnect(self, client: Client):
        self.log_info(client)
