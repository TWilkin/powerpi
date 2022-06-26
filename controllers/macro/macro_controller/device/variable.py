from powerpi_common.config import Config
from powerpi_common.device import Device
from powerpi_common.logger import Logger
from powerpi_common.mqtt import MQTTClient


class VariableDevice(Device):
    def __init__(
        self,
        config: Config,
        logger: Logger,
        mqtt_client: MQTTClient,
        **kwargs
    ):
        Device.__init__(
            self, config, logger, mqtt_client, **kwargs
        )

    async def _turn_on(self):
        # doesn't have to do anything special, just broadcast the status change
        pass

    async def _turn_off(self):
        # doesn't have to do anything special, just broadcast the status change
        pass
