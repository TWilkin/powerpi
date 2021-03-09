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

    def start_activity(self, name: str):
        activities = self.__activities()

        if name in activities:
            with self.__client as client:
                if client:
                    client.start_activity(activities[name])
        else:
            self._logger.error(
                'Activity "{}" for {} not found'.format(name, self)
            )

    @cached(cache=TTLCache(maxsize=1, ttl=10 * 60))
    def __config(self):
        self._logger.info(
            'Loading config for {}'.format(self)
        )

        with self.__client as client:
            if client:
                with self.__cache_lock:
                    return client.get_config()

    @cached(cache=TTLCache(maxsize=1, ttl=10 * 60))
    def __activities(self):
        activities = {}

        for activity in self.__config()['activity']:
            activities[activity['label']] = int(activity['id'])

        self._logger.info(
            'Found {} activities for {}'.format(len(activities), self)
        )

        return activities

    def __str__(self):
        return 'HarmonyHubDevice({})'.format(self.name)
