from pyenergenie import energenie

from powerpi_common.config import Config
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient
from . socket import SocketDevice, SocketGroupDevice


energenie.init()


class SocketDeviceImpl(SocketDevice, energenie.Devices.ENER002):

    def __init__(
        self, config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        name, home_id, device_id=0, retries=4, delay=0.5
    ):
        SocketDevice.__init__(
            self, config, logger, mqtt_client, name, home_id, device_id, retries, delay
        )
        energenie.Devices.ENER002.__init__(
            self, (int(home_id), int(device_id))
        )

    def _turn_on(self):
        self._run(energenie.Devices.ENER002.turn_on, 'on', self)

    def _turn_off(self):
        self._run(energenie.Devices.ENER002.turn_off, 'off', self)


class SocketGroupDeviceImpl(SocketGroupDevice, energenie.Devices.ENER002):

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        device_manager, name, home_id, devices, retries=4, delay=0.5
    ):
        SocketGroupDevice.__init__(
            self, config, logger, mqtt_client, device_manager, name, devices, home_id, retries, delay
        )
        energenie.Devices.ENER002.__init__(self, (int(home_id), 0))

    def _turn_on(self):
        self.__run(energenie.Devices.ENER002.turn_on, 'on', self)

    def _turn_off(self):
        self.__run(energenie.Devices.ENER002.turn_off, 'off', self)
