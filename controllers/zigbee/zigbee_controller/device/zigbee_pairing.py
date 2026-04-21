import asyncio

from powerpi_common.device import Device
from powerpi_common.device.mixin import InitialisableMixin
from zigpy.device import Device as ZigPyDevice
from zigpy.types import EUI64

from zigbee_controller.zigbee import DeviceJoinListener, ZigbeeController


# pylint: disable=too-many-ancestors
class ZigbeePairingDevice(Device, InitialisableMixin):
    '''
    Device to allow new devices to be paired to the ZigBee controller managed by this service.
    '''

    def __init__(
        self,
        zigbee_controller: ZigbeeController,
        timeout: int = 120,
        **kwargs
    ):
        Device.__init__(self, **kwargs)

        self.__zigbee_controller = zigbee_controller
        self.__timeout = timeout

    async def initialise(self):
        self.__zigbee_controller.add_listener(
            DeviceJoinListener(self.on_device_join)
        )

    async def _turn_on(self):
        # run in a separate task so the off state happens after the on
        _ = asyncio.create_task(self.pair())

    async def _turn_off(self):
        await self.__zigbee_controller.pair(0)

    async def pair(self):
        await self.__zigbee_controller.pair(self.__timeout)
        await asyncio.sleep(self.__timeout)

        await self.turn_off()

    def on_device_join(self, device: ZigPyDevice):
        self.log_info('New device joined network')

        # we don't need to do initialisation yet as the device needs to be added
        # to the config
        device.cancel_initialization()

        topic = f'device/{self.name}/join'

        ieee = EUI64(device.ieee)

        message = {
            'nwk': f'0x{device.nwk:04x}',
            'ieee': f'{ieee}'
        }

        self._producer(topic, message)
