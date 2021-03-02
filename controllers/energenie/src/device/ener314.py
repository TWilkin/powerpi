from energenie import switch_on, switch_off

from common.config import Config
from common.logger import Logger
from common.mqtt import MQTTClient
from . socket import SocketDevice, SocketGroupDevice


class SocketDeviceImpl(SocketDevice):

    def __init__(
        self, config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name, home_id=0, device_id=0, retries=4, delay=0.5
    ):
        SocketDevice.__init__(
            self, config, logger, mqtt_client, name, home_id, device_id, retries, delay
        )
        self.__device_id = int(device_id)

    def turn_on(self):
        SocketDevice.turn_on(self)
        self._run(switch_on, 'on', self.__device_id)

    def turn_off(self):
        SocketDevice.turn_off(self)
        self._run(switch_off, 'off', self.__device_id)


class SocketGroupDeviceImpl(SocketGroupDevice):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager, name, devices, home_id=None, retries=4, delay=0.5
    ):
        SocketGroupDevice.__init__(
            self, config, logger, mqtt_client, device_manager, name, devices, home_id, retries, delay
        )

    def turn_on(self):
        SocketGroupDevice.turn_on(self)
        self._run(switch_on, 'on')

    def turn_off(self):
        SocketGroupDevice.turn_off(self)
        self._run(switch_off, 'off')
