from icmplib import async_ping
from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class RemoteNodeDevice(Device, PollableMixin):
    # pylint: disable=too-many-ancestors
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        ip: str,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)

        self.__ip = ip

    async def poll(self):
        result = await async_ping(self.__ip, count=4, interval=0.2, timeout=2, privileged=False)

        new_state = DeviceStatus.ON if result.is_alive else DeviceStatus.OFF

        if new_state != self.state:
            self.state = new_state

    async def _turn_on(self):
        # there's nothing we can do to turn the remote device on
        pass

    async def _turn_off(self):
        # there's nothing we can do to turn the remote device off
        pass
