from cachetools import cached, TTLCache
from threading import Lock

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.mqtt import MQTTClient
from harmony_controller.device.harmony_client import HarmonyClient


class HarmonyHubDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        harmony_client: HarmonyClient,
        name: str,
        ip: str = None,
        hostname: str = None,
        port: int = 5222
    ):
        Device.__init__(self, config, logger, mqtt_client, name)

        self.__client = harmony_client
        self.__client.address = hostname if hostname is not None else ip
        self.__client.port = port

        self.__cache_lock = Lock()

    def _turn_on(self):
        pass

    def _turn_off(self):
        with self.__client as client:
            if client:
                client.power_off()

    @cached(cache=TTLCache(maxsize=1, ttl=10 * 60))
    def config(self):
        with self.__client as client:
            if client:
                with self.__cache_lock:
                    return client.get_config()
