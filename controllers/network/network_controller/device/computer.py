from asyncio import sleep

from powerpi_common.device import Device, DeviceStatus
from powerpi_common.device.mixin import PollableMixin
from wakeonlan import send_magic_packet

from network_controller.util import ping


class ComputerDevice(Device, PollableMixin):
    # pylint: disable=too-many-ancestors

    '''
    Device for controlling networked computers.
    '''

    def __init__(
        self,
        mac: str,
        ip: str | None = None,
        hostname: str | None = None,
        delay: int = 10,
        **kwargs
    ):
        # pylint: disable=too-many-arguments,too-many-positional-arguments
        Device.__init__(self, **kwargs)
        PollableMixin.__init__(self, **kwargs)

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
        result = await ping(self.__network_address, count)

        return result.is_alive
