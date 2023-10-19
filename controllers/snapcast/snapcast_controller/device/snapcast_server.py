from typing import List, Set

from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import InitialisableMixin, NewPollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from snapcast_controller.device.mixin import StreamCapabilityMixin
from snapcast_controller.snapcast.listener import SnapcastServerListener
from snapcast_controller.snapcast.snapcast_api import SnapcastAPI
from snapcast_controller.snapcast.typing import Server


class SnapcastServerDevice(Device, InitialisableMixin, NewPollableMixin, SnapcastServerListener):
    # pylint: disable=too-many-ancestors

    '''
    Device for configuring a Snapcast server, providing the mechanism for a client to be configured
    with the stream the user wishes to play.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        snapcast_api: SnapcastAPI,
        ip: str | None = None,
        hostname: str | None = None,
        port: int | None = 1780,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        NewPollableMixin.__init__(self, config, **kwargs)

        self.__device_manager = device_manager
        self.__api = snapcast_api

        self.__network_address = ip if ip is not None else hostname
        self.__port = port

        self.__streams: Set[str] = set()

    @property
    def network_address(self):
        return self.__network_address

    @property
    def port(self):
        return self.__port

    @property
    def api(self):
        return self.__api

    @property
    def clients(self) -> List[StreamCapabilityMixin]:
        return list(filter(
            lambda device: getattr(device, 'server_name', None) == self.name,
            self.__device_manager.devices.values()
        ))

    async def initialise(self):
        await self.__api.connect(self.network_address, self.port)

        self.__api.add_listener(self)

        self.state = DeviceStatus.ON if self.__api.connected else DeviceStatus.OFF

    async def deinitialise(self):
        await self.__api.disconnect()

    async def on_server_update(self, server: Server):
        new_streams = {stream.id for stream in server.streams}

        if self.__streams != new_streams:
            # the streams have changed
            self.__streams = new_streams

            as_list = list(new_streams)

            for client in self.clients:
                client.streams = as_list

    async def _poll(self):
        response = await self.__api.get_status()

        await self.on_server_update(response.server)

    async def _turn_on(self):
        # this device doesn't support on/off
        return self.__api.connected

    async def _turn_off(self):
        # this device doesn't support on/off
        return self.__api.connected
