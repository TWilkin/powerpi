from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class ComputerDevice(Device):
    '''
    Device for controlling networked computers.
    '''

    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        mac: str,
        ip: str = None,
        hostname: str = None,
        **kwargs
    ):
        # pylint: disable=too-many-arguments
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__mac_address = mac
        self.__network_address = ip if ip is not None else hostname

    @property
    def mac_address(self):
        return self.__mac_address

    @property
    def network_address(self):
        return self.__network_address

    async def _turn_on(self):
        pass

    async def _turn_off(self):
        pass
