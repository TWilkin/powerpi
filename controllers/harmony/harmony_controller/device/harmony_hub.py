from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.mqtt import MQTTClient


class HarmonyHubDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name: str
    ):
        Device.__init__(self, config, logger, mqtt_client, name)
