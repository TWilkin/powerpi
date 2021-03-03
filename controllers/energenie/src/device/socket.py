import time

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.device import Device
from powerpi_common.mqtt import MQTTClient, PowerEventConsumer
from . manager import DeviceManager


class SocketDevice(Device, PowerEventConsumer):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name, home_id=0, device_id=0, retries=4, delay=0.5,
    ):
        Device.__init__(self, mqtt_client, name)
        PowerEventConsumer.__init__(self, self, config, logger)

        self.__logger = logger
        self.__retries = retries
        self.__delay = delay

        mqtt_client.add_consumer(self)

    @Device.state.setter
    def state(self, new_state):
        Device.state.fset(self, new_state)
        self.__logger.info(
            'Socket "{}" now has state {}'.format(self._name, self.state)
        )

    def turn_on(self):
        self.__logger.info(
            'Turning on socket "{name}"'.format(name=self._name))

    def turn_off(self):
        self.__logger.info(
            'Turning off socket "{name}"'.format(name=self._name))

    def _run(self, func, new_state, *params):
        for _ in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        self.state = new_state


class SocketGroupDevice(Device, PowerEventConsumer):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager: DeviceManager,
        name, devices, home_id=None, retries=4, delay=0.5
    ):
        Device.__init__(self, mqtt_client, name)
        PowerEventConsumer.__init__(self, self, config, logger)

        self.__logger = logger
        self.__device_manager = device_manager
        self.__devices = devices
        self.__retries = retries
        self.__delay = delay

        mqtt_client.add_consumer(self)

    @Device.state.setter
    def state(self, new_state):
        Device.state.fset(self, new_state)
        self.__logger.info(
            'Socket group "{}" now has state {}'.format(
                self._name, self.state)
        )

    def turn_on(self):
        self.__logger.info(
            'Turning on socket group "{name}"'.format(name=self._name))

    def turn_off(self):
        self.__logger.info(
            'Turning off socket group "{name}"'.format(name=self._name))

    def _run(self, func, new_state, *params):
        for _ in range(0, self.__retries):
            func(*params)
            time.sleep(self.__delay)

        for device in self.__devices:
            self.__device_manager.get_device(device).state = new_state

        self.state = new_state
