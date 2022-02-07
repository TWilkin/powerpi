import asyncio
import atexit

from zigpy.typing import DeviceType
from zigpy_znp.zigbee.application import ControllerApplication

from powerpi_common.logger import Logger
from zigbee_controller.config import ZigbeeConfig


class ZigbeeController(object):
    def __init__(self, config: ZigbeeConfig, logger: Logger):
        self.__logger = logger

        config = {
            "device": {
                "path": config.zigbee_device
            }
        }

        self.__controller = ControllerApplication(config)
    
    async def startup(self):
        self.__controller.add_listener(self)

        await self.__controller.startup(auto_form=True)

    async def shutdown(self):
        await self.__controller.shutdown()

    async def pair(self, time=60):
        self.__logger.info('Starting pair permit')

        await self.__controller.permit(time)
        await asyncio.sleep(time)

        self.__logger.info('Terminating pair permit')

    def device_joined(self, device: DeviceType):
        self.__logger.info(f'Device {device} joined')
    
    atexit.register
    def __shutdown(self):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.shutdown())
