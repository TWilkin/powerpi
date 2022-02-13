from cachetools import cached, TTLCache
from threading import Lock

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import AsyncDevice, Device, DeviceManager
from powerpi_common.mqtt import MQTTClient
from harmony_controller.device.harmony_client import HarmonyClient


class Activity(object):
    def __init__(
        self, id: int, device: Device
    ):
        self.__id = id
        self.__device = device

    @property
    def id(self):
        return self.__id

    @property
    def device(self):
        return self.__device


class HarmonyHubDevice(AsyncDevice):
    __POWER_OFF_ID = -1

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
        port: int = 5222,
        **kwargs
    ):
        AsyncDevice.__init__(
            self, config, logger, mqtt_client, name, **kwargs
        )

        self.__device_manager = device_manager

        self.__client = harmony_client
        self.__client.address = hostname if hostname is not None else ip
        self.__client.port = port

        self.__cache_lock = Lock()
        self.__activity_lock = Lock()

    def poll(self):
        current_activity_id = self.__client.get_current_activity()

        self.__update_activity_state(current_activity_id)

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        with self.__activity_lock:
            self.__client.power_off()

        # update the state to off for all activities
        self.__update_activity_state(self.__POWER_OFF_ID)

    def start_activity(self, name: str):
        activities = self.__activities()

        if name in activities:
            with self.__activity_lock:
                self.__client.start_activity(activities[name].id)

                # only one activity can be started, so update the state
                self.__update_activity_state(activities[name].id, False)
        else:
            self._logger.error(
                f'Activity "{name}" for {self} not found'
            )

    @cached(cache=TTLCache(maxsize=1, ttl=10 * 60))
    def __config(self):
        self._logger.info(
            f'Loading config for {self}'
        )

        with self.__cache_lock:
            return self.__client.get_config()

    @cached(cache=TTLCache(maxsize=1, ttl=10 * 60))
    def __activities(self):
        devices = self.__device_manager.devices.values()
        activities = {}

        for activity in self.__config()['activity']:
            device = next(
                (device for device in devices if
                    hasattr(device, 'activity_name')
                    and device.activity_name == activity['label']
                 ),
                None
            )

            if device is not None:
                activities[activity['label']] = Activity(
                    int(activity['id']),
                    device
                )

        self._logger.info(
            f'Found {len(activities)} activities for {self}'
        )

        return activities

    def __update_activity_state(self, current_activity_id: int, update_current=True):
        for activity in self.__activities().values():
            # when we're running start_activity we don't want to update the current
            # as it will update itself when we return from that call
            if activity.id == current_activity_id and not update_current:
                continue

            new_state = 'on' if activity.id == current_activity_id else 'off'

            if activity.device.state != new_state:
                activity.device.state = new_state
