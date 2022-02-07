import atexit

from zigpy_znp.zigbee.application import ControllerApplication

from zigbee_controller.config import ZigbeeConfig


class ZigbeeController(object):
    def __init__(self, config: ZigbeeConfig):
        config = {
            "device": {
                "path": config.zigbee_device
            }
        }

        self.__controller = ControllerApplication(config)

        atexit.register(self.shutdown)
    
    async def startup(self):
        await self.__controller.startup()

    async def shutdown(self):
        await self.__controller.shutdown()
