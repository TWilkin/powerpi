from cachetools import cached, TTLCache
from threading import Lock

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import DeviceManager, ThreadedDevice
from powerpi_common.mqtt import MQTTClient
from harmony_controller.device.harmony_client import HarmonyClient


class HarmonyHubDevice(ThreadedDevice):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        harmony_client: HarmonyClient,
        name: str,
        ip: str = None,
        hostname: str = None,
        port: int = 5222
    ):
        ThreadedDevice.__init__(self, config, logger, mqtt_client, name)

        self.__device_manager = device_manager

        self.__client = harmony_client
        self.__client.address = hostname if hostname is not None else ip
        self.__client.port = port

        self.__cache_lock = Lock()

    def poll(self):
        with self.__client as client:
            if client:
                current_activity_id = client.get_current_activity()

                for activity, activity_id in self.__activities().items():
                    try:
                        device = self.__device_manager.get_device(activity)
                        current_state = device.state
                        new_state = 'on' if activity_id == current_activity_id else 'off'

                        if current_state != new_state:
                            device.state = new_state
                    except:
                        # probably an unregistered activity or PowerOff
                        pass

    def _turn_on(self):
        pass

    def _turn_off(self):
        with self._lock, self.__client as client:
            if client:
                client.power_off()

        # update the state to off for all activities
        for activity in self.__activities():
            try:
                device = self.__device_manager.get_device(activity)
                device.state = 'off'
            except:
                # probably an unregistered activity or PowerOff
                pass

    def start_activity(self, name: str):
        activities = self.__activities()

        if name in activities:
            with self._lock, self.__client as client:
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

        with self._lock, self.__client as client:
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
