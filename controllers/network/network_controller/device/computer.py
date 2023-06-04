from asyncio import sleep

from icmplib import async_ping
from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from wakeonlan import send_magic_packet


class ComputerDevice(Device, PollableMixin):
    # pylint: disable=too-many-ancestors

    '''
    Device for controlling networked computers.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        mac: str,
        ip: str = None,
        hostname: str = None,
        delay: int = 1,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)
        PollableMixin.__init__(self, config, **kwargs)

        self.__mac_address = mac
        self.__network_address = ip if ip is not None else hostname
        self.__delay = delay

    @property
    def mac_address(self):
        return self.__mac_address

    @property
    def network_address(self):
        return self.__network_address

    async def poll(self):
        is_alive = await self.__is_alive(4)

        new_state = DeviceStatus.ON if is_alive else DeviceStatus.OFF

        if new_state != self.state:
            self.state = new_state

    async def _turn_on(self):
        for _ in range(0, 4):
            send_magic_packet(self.__mac_address)

            await sleep(self.__delay)

            if await self.__is_alive():
                return True

        return False

    async def _turn_off(self):
        # do nothing as this will be handled by the shutdown service running on that computer
        return False

    async def __is_alive(self, count=1):
        result = await async_ping(self.__network_address, count=count, interval=0.2, timeout=2)

        return result.is_alive
