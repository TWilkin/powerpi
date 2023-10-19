from typing import TypedDict

from powerpi_common.config import Config
from powerpi_common.device import (AdditionalStateDevice, DeviceManager,
                                   DeviceStatus)
from powerpi_common.device.mixin import CapabilityMixin, InitialisableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

from snapcast_controller.device.snapcast_server import SnapcastServerDevice
from snapcast_controller.snapcast.listener import (SnapcastClientListener,
                                                   SnapcastGroupListener)
from snapcast_controller.snapcast.typing import Client


class AdditionalState(TypedDict):
    stream: str


class SnapcastClientDevice(
    AdditionalStateDevice,
    InitialisableMixin,
    CapabilityMixin,
    SnapcastClientListener,
    SnapcastGroupListener
):
    # pylint: disable=too-many-ancestors, too-many-instance-attributes

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
        AdditionalStateDevice.__init__(
            self, config, logger, mqtt_client, **kwargs
        )

        self.__device_manager = device_manager
        self.__server_name = server
        self.__mac = mac
        self.__host_id = host_id
        self.__client_id: str | None = None

    @property
    def server_name(self):
        return self.__server_name

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

    async def on_additional_state_change(self, new_additional_state: AdditionalState):
        if new_additional_state is not None:
            stream = new_additional_state['stream']

            # get the current status
            status = await self.__server().api.get_status()

            # find the stream
            if stream in [stream.id for stream in status.server.streams]:
                # find a group playing this stream
                group = next(
                    (group for group in status.server.groups if group.stream_id == stream),
                    None
                )

                if group is not None:
                    clients = [client.id for client in group.clients]
                    clients.append(self.client_id)

                    await self.__server().api.set_group_clients(group.id, clients)

                    return new_additional_state

                # otherwise set this stream for the group this client belongs to
                group = next(
                    (group for group in status.server.groups
                     if self.client_id in [client.id for client in group.clients]),
                    None
                )

                if group is not None:
                    await self.__server().api.set_group_stream(group.id, stream)

                    return new_additional_state

        # if it was unsuccessful don't update additional state
        return []

    async def on_client_connect(self, client: Client):
        if client.host.mac == self.mac or client.host.name == self.host_id:
            self.state = DeviceStatus.ON
            self.__client_id = client.id

            await self.__server().api.set_client_name(client.id, self.display_name)

    async def on_client_disconnect(self, client: Client):
        if client.host.mac == self.mac or client.host.name == self.host_id:
            self.state = DeviceStatus.OFF

    async def on_group_stream_changed(self, stream_id: str):
        if self.additional_state['stream'] != stream_id:
            self.additional_state = {'stream': stream_id}

    def _additional_state_keys(self):
        return ['stream']

    async def _turn_on(self):
        # this device doesn't support on/off
        pass

    async def _turn_off(self):
        # this device doesn't support on/off
        pass

    def __server(self) -> SnapcastServerDevice:
        return self.__device_manager.get_device(self.__server_name)
