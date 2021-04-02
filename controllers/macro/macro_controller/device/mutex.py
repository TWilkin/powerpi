from lazy import lazy
from typing import List

from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, ThreadedDevice
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class MutexDevice(ThreadedDevice):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        name: str,
        on_devices: List[str],
        off_devices: List[str]
    ):
        ThreadedDevice.__init__(self, config, logger, mqtt_client, name)

        self.__device_manager = device_manager
        self.__on_device_names = on_devices
        self.__off_device_names = off_devices

    def poll(self):
        all_on = True
        all_off = True

        for device in self.__on_devices:
            all_on &= device.state == 'on'
            all_off &= device.state == 'off'

        for device in self.__off_devices:
            all_on &= device.state == 'off'
            all_off &= device.state == 'off'

        if all_on and self.state != 'on':
            self.status = 'on'
        elif all_off and self.state != 'off':
            self.status = 'off'

    def _turn_on(self):
        for device in self.__off_devices:
            device.turn_off()

        for device in self.__on_devices:
            device.turn_on()

    def _turn_off(self):
        for device in self.__on_devices + self.__off_devices:
            device.turn_off()

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
