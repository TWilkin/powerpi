import asyncio

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
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__zigbee_controller = zigbee_controller
    
    def _poll(self):
        pass

    async def _turn_on(self):
        # run in a separate task so the off state happens after the on
        loop = asyncio.get_event_loop()
        loop.create_task(self.__pair())
        
    
    def _turn_off(self):
        pass

    async def __pair(self):
        time = 2

        await self.__zigbee_controller.pair(time)
        await asyncio.sleep(time)

        self.state = DeviceStatus.OFF
