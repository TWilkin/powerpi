from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import InitialisableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from snapcast_controller.device.snapcast_server import SnapcastServerDevice
from snapcast_controller.snapcast.listener import SnapcastClientListener
from snapcast_controller.snapcast.typing import Client


class SnapcastClientDevice(Device, InitialisableMixin, SnapcastClientListener):
    # pylint: disable=too-many-ancestors

    '''
    Device for configuring a Snapcast client, which can receive additional state indicating which
    stream it should play.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        server: str,
        mac: str | None = None,
        host_id: str | None = None,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__device_manager = device_manager
        self.__server_name = server
        self.__mac = mac
        self.__host_id = host_id
        self.__client_id: str | None = None

    @property
    def mac(self):
        return self.__mac

    @property
    def host_id(self):
        return self.__host_id if self.__host_id else self._name

    @property
    def client_id(self):
        return self.__client_id

    async def initialise(self):
        self.__server().api.add_listener(self)

    async def deinitialise(self):
        self.__server().api.remove_listener(self)

    async def _turn_on(self):
        # this device doesn't support on/off
        pass

    async def _turn_off(self):
        # this device doesn't support on/off
        pass

    async def on_client_connect(self, client: Client):
        if client.host.mac == self.mac or client.host.name == self.host_id:
            self.state = DeviceStatus.ON
            self.__client_id = client.id

            await self.__server().api.set_client_name(client.id, self.display_name)

    async def on_client_disconnect(self, client: Client):
        if client.host.mac == self.mac or client.host.name == self.host_id:
            self.state = DeviceStatus.OFF

    def __server(self) -> SnapcastServerDevice:
        return self.__device_manager.get_device(self.__server_name)
