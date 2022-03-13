from threading import Lock
from typing import Dict, NamedTuple

from cache import AsyncTTL

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device, DeviceManager, DeviceStatus
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.mqtt import MQTTClient
from .harmony_client import HarmonyClient


class Activity(NamedTuple):
    id: int
    device: Device

    def __str__(self):
        return f'{self.id}: {self.device}'


class HarmonyHubDevice(Device, PollableMixin):
    __POWER_OFF_ID = -1

    #pylint: disable=too-many-arguments
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        harmony_client: HarmonyClient,
        ip: str = None,
        hostname: str = None,
        port: int = 5222,
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )

        self.__device_manager = device_manager

        self.__client = harmony_client
        self.__client.address = hostname if hostname is not None else ip
        self.__client.port = port

        self.__cache_lock = Lock()
        self.__activity_lock = Lock()

    @property
    def activities(self):
        return list(filter(
            lambda device: getattr(device, 'hub_name', None) == self.name,
            self.__device_manager.devices.values()
        ))

    async def _poll(self):
        # pylint: disable=broad-except
        try:
            current_activity_id = await self.__client.get_current_activity()

            await self.__update_activity_state(current_activity_id)

            new_state = DeviceStatus.ON if current_activity_id != self.__POWER_OFF_ID \
                else DeviceStatus.OFF

            if self.state != new_state:
                self.state = new_state
        except Exception:
            self.__update_to_unknown()

    def _turn_on(self):
        pass

    async def _turn_off(self):
        # pylint: disable=broad-except
        try:
            with self.__activity_lock:
                await self.__client.power_off()

            # update the state to off for all activities
            await self.__update_activity_state(self.__POWER_OFF_ID)
        except Exception as ex:
            self.__update_to_unknown(False)
            raise ex

    async def start_activity(self, name: str):
        activities = await self.__activities()

        if name in activities:
            with self.__activity_lock:
                # pylint: disable=broad-except
                try:
                    await self.__client.start_activity(activities[name].id)

                    # only one activity can be started, so update the state
                    await self.__update_activity_state(activities[name].id, False)

                    new_state = DeviceStatus.ON
                    if self.state != new_state:
                        self.state = new_state
                except Exception as ex:
                    self.__update_to_unknown()
                    raise ex
        else:
            self._logger.error(
                f'Activity "{name}" for {self} not found'
            )

    @AsyncTTL(maxsize=1, time_to_live=10 * 60, skip_args=1)
    async def __config(self):
        self._logger.info(
            f'Loading config for {self}'
        )

        with self.__cache_lock:
            return await self.__client.get_config()

    async def __activities(self) -> Dict[str, Activity]:
        devices = self.activities
        activities = {}

        config = await self.__config()
        for activity in config['activity']:
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

    async def __update_activity_state(self, current_activity_id: int, update_current: bool = True):
        activities = await self.__activities()

        for activity in activities.values():
            # when we're running start_activity we don't want to update the current
            # as it will update itself when we return from that call
            if activity.id == current_activity_id and not update_current:
                continue

            new_state = DeviceStatus.ON if activity.id == current_activity_id else DeviceStatus.OFF

            if activity.device.state != new_state:
                activity.device.state = new_state

    def __update_to_unknown(self, include_self: bool = False):
        # there was an error so we don't know what state the hub is in
        if include_self and self.state != DeviceStatus.UNKNOWN:
            self.state = DeviceStatus.UNKNOWN

        # find the device manager devices for this hub and update them
        for activity in self.activities:
            if activity.state != DeviceStatus.UNKNOWN:
                activity.state = DeviceStatus.UNKNOWN
