from lazy import lazy

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import DeviceManager, ThreadedDevice
from powerpi_common.mqtt import MQTTClient
from .harmony_hub import HarmonyHubDevice


class HarmonyActivityDevice(ThreadedDevice):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        name: str,
        hub: str
    ):
        ThreadedDevice.__init__(self, config, logger, mqtt_client, name)

        self.__device_manager = device_manager
        self.__hub_name = hub

    def poll(self):
        pass

    @lazy
    def __hub(self) -> HarmonyHubDevice:
        return self.__device_manager.get_device(self.__hub_name)

    def _turn_on(self):
        self.__hub.start_activity(self._name)

    def _turn_off(self):
        self.__hub.turn_off()
