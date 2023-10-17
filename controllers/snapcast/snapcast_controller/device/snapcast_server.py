from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient

class SnapcastServerDevice(Device):
    '''
    Device for getting and sending data from the snapcast server.
    '''
    
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        ip: str | None = None,
        hostname: str | None = None,
        **kwargs
    ):
        Device.__init__(self, config, logger, mqtt_client, **kwargs)

        self.__network_address = ip if ip is not None else hostname

    @property
    def network_address(self):
        return self.__network_address

    async def _turn_on(self):
        # this device doesn't support on/off
        pass
    
    async def _turn_off(self):
        # this device doesn't support on/off
        pass
