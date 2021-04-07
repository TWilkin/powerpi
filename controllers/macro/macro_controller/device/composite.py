from lazy import lazy
from typing import List

from powerpi_common.config import Config
from powerpi_common.device import Device, DeviceManager, ThreadedDevice
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class CompositeDevice(ThreadedDevice):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        name: str,
        devices: List[str],
        **kwargs
    ):
        ThreadedDevice.__init__(self, config, logger,
                                mqtt_client, name, **kwargs)

        self.__device_manager = device_manager
        self.__device_names = devices

    def poll(self):
        all_on = True
        all_off = True

        for device in self.__devices:
            all_on &= device.state == 'on'
            all_off &= device.state == 'off'

        if all_on and self.state != 'on':
            self.state = 'on'
        elif all_off and self.state != 'off':
            self.state = 'off'

    def _turn_on(self):
        for device in self.__devices:
            device.turn_on()

    def _turn_off(self):
        for device in reversed(self.__devices):
            device.turn_off()

    @lazy
    def __devices(self) -> List[Device]:
        devices = []

        for name in self.__device_names:
            try:
                devices.append(self.__device_manager.get_device(name))
            except:
                # ignore this for now
                pass

        return devices
