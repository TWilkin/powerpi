import asyncio

from zigpy.types import EUI64
from zigpy.typing import DeviceType

from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceStatus
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from .zigbee_controller import ZigbeeController


class ZigbeePairingDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        zigbee_controller: ZigbeeController,
        timeout: int = 120,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__zigbee_controller = zigbee_controller
        self.__timeout = timeout

        self.__zigbee_controller.add_listener(self)
    
    def _poll(self):
        pass

    def _turn_on(self):
        # run in a separate task so the off state happens after the on
        loop = asyncio.get_event_loop()
        loop.create_task(self.pair())
        
    
    def _turn_off(self):
        pass

    async def pair(self):
        await self.__zigbee_controller.pair(self.__timeout)
        await asyncio.sleep(self.__timeout)

        self.state = DeviceStatus.OFF
    
    def device_joined(self, device: DeviceType):
        topic = f'device/{self.name}/join'

        ieee = EUI64(device.ieee)

        message = {
            'nwk': f'0x{device.nwk:04x}',
            'ieee': f'{ieee}'
        }

        self._producer(topic, message)
