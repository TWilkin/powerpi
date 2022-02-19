from lazy import lazy

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager
from powerpi_common.mqtt import MQTTClient
from .harmony_hub import HarmonyHubDevice


class HarmonyActivityDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        name: str,
        hub: str,
        activity_name: str = None,
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, name, **kwargs
        )

        self.__device_manager = device_manager
        self.__hub_name = hub
        self.__activity_name = activity_name if activity_name is not None else name

    @property
    def activity_name(self):
        return self.__activity_name

    @lazy
    def __hub(self) -> HarmonyHubDevice:
        return self.__device_manager.get_device(self.__hub_name)
    
    def _poll(self):
        pass

    async def _turn_on(self):
        await self.__hub.start_activity(self.__activity_name)

    async def _turn_off(self):
        await self.__hub.turn_off()
