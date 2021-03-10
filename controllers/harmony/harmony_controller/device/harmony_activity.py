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
        hub: str
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__device_manager = device_manager
        self.__hub_name = hub

    @lazy
    def __hub(self) -> HarmonyHubDevice:
        return self.__device_manager.get_device(self.__hub_name)

    def _turn_on(self):
        self.__hub.start_activity(self._name)

    def _turn_off(self):
        self.__hub.turn_off()
