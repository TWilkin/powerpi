from lazy import lazy
from typing import List

from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager
from powerpi_common.device.mixin import PollableMixin
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class MutexDevice(Device, PollableMixin):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        on_devices: List[str],
        off_devices: List[str],
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )

        self.__device_manager = device_manager
        self.__on_device_names = on_devices
        self.__off_device_names = off_devices

    def _poll(self):
        all_on = True
        all_off = True

        for device in self.__on_devices:
            all_on &= device.state == 'on'
            all_off &= device.state == 'off'

        for device in self.__off_devices:
            all_on &= device.state == 'off'
            all_off &= device.state == 'off'

        if all_on and self.state != 'on':
            self.state = 'on'
        elif all_off and self.state != 'off':
            self.state = 'off'

    async def _turn_on(self):
        for device in self.__off_devices:
            await device.turn_off()

        for device in self.__on_devices:
            await device.turn_on()

    async def _turn_off(self):
        for device in self.__on_devices + self.__off_devices:
            await device.turn_off()

    @lazy
    def __on_devices(self) -> List[Device]:
        return self.__get_devices(self.__on_device_names)

    @lazy
    def __off_devices(self) -> List[Device]:
        return self.__get_devices(self.__off_device_names)

    def __get_devices(self, names: List[str]) -> List[Device]:
        devices = []

        for name in names:
            try:
                devices.append(self.__device_manager.get_device(name))
            except:
                # ignore this for now
                pass

        return devices
